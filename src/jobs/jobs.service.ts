import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        title: dto.title,
        company: dto.company,
        industry: dto.industry,
        category: dto.category,
        location: dto.location,
        mode: dto.mode,
        type: dto.type,
        salary: dto.salary,
        vacancies: dto.vacancies ?? 1,
        description: dto.description,
        requirements: dto.requirements ?? [],
        benefits: dto.benefits ?? [],
        isPublished: dto.isPublished ?? true,
      },
    });
    return { success: true, data: job };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    mode?: string;
    published?: string; // 'true' | 'false' | undefined (all — admin only)
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Public endpoint: only published jobs; admin can pass published=all
    if (query.published === 'false') {
      where.isPublished = false;
    } else if (query.published === 'all') {
      // no filter — return everything (used by admin)
    } else {
      // default: only published
      where.isPublished = true;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.mode) {
      where.mode = { contains: query.mode, mode: 'insensitive' };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        include: {
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { postedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return { success: true, data: job };
  }

  async update(id: string, dto: UpdateJobDto) {
    await this.findOne(id);
    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.company !== undefined && { company: dto.company }),
        ...(dto.industry !== undefined && { industry: dto.industry }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.mode !== undefined && { mode: dto.mode }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.salary !== undefined && { salary: dto.salary }),
        ...(dto.vacancies !== undefined && { vacancies: dto.vacancies }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.requirements !== undefined && { requirements: dto.requirements }),
        ...(dto.benefits !== undefined && { benefits: dto.benefits }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
    return { success: true, data: job };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.job.delete({ where: { id } });
    return { success: true, message: 'Job deleted successfully' };
  }

  async getStats() {
    const [total, published, unpublished, vacanciesAgg] = await this.prisma.$transaction([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { isPublished: true } }),
      this.prisma.job.count({ where: { isPublished: false } }),
      this.prisma.job.aggregate({ _sum: { vacancies: true } }),
    ]);
    return {
      success: true,
      data: {
        total,
        published,
        unpublished,
        totalVacancies: vacanciesAgg._sum.vacancies ?? 0,
      },
    };
  }
}
