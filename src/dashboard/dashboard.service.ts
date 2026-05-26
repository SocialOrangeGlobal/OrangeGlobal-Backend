import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalTalents,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsByStatus,
      recentApplications,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'TALENT' } }),
      this.prisma.user.count({ where: { role: 'EMPLOYER' } }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { isPublished: true } }),
      this.prisma.application.count(),
      this.prisma.application.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.application.findMany({
        take: 5,
        orderBy: { appliedAt: 'desc' },
        include: {
          talent: { select: { fullName: true, avatarUrl: true } },
          job: { select: { title: true } },
        },
      }),
    ]);

    // Format applications by status for easy frontend parsing
    const appStatusMap = applicationsByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      metrics: {
        totalUsers,
        totalTalents,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
      },
      applicationStatusDistribution: appStatusMap,
      recentApplications: recentApplications.map((app) => ({
        id: app.id,
        candidateName: app.talent.fullName,
        candidateAvatar: app.talent.avatarUrl,
        jobTitle: app.job.title,
        status: app.status,
        appliedAt: app.appliedAt,
        atsScore: app.atsScore,
      })),
    };
  }
}
