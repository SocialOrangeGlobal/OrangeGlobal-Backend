import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { UserRole } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateContactMessageDto) {
    this.logger.log(`Handling contact submission from ${dto.email}`);

    // 1. Save to Database
    const savedMessage = await this.prisma.contactMessage.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
        type: dto.type || 'GENERAL_QUERY',
        status: 'PENDING',
        userId: dto.userId || null,
      },
    });

    // 2. Send Notification/Welcome Email
    try {
      if (dto.type === 'NEWSLETTER') {
        await this.mailService.sendNewsletterWelcomeEmail(dto.email);
      }
      await this.mailService.sendContactNotificationEmail(dto);
    } catch (error: any) {
      this.logger.error(`Failed to send contact email notification: ${error.message}`);
    }

    return {
      message: 'Your message has been submitted successfully.',
      id: savedMessage.id,
    };
  }

  async findAll(page = 1, limit = 10, type?: string, status?: string, search?: string) {
    this.logger.log(`Fetching paginated contact messages for admin`);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        include: {
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
                select: {
                  email: true,
                  role: true,
                  adminProfile: { select: { firstName: true, lastName: true } },
                  talentProfile: { select: { fullName: true } },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async updateEnquiry(id: string, dto: UpdateEnquiryDto) {
    const enquiry = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!enquiry) {
      throw new NotFoundException(`Enquiry with ID ${id} not found`);
    }

    return this.prisma.contactMessage.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async addReply(id: string, senderId: string, senderRole: UserRole, dto: ReplyContactMessageDto) {
    const enquiry = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!enquiry) {
      throw new NotFoundException(`Enquiry with ID ${id} not found`);
    }

    const reply = await this.prisma.contactReply.create({
      data: {
        contactMessageId: id,
        senderId,
        senderRole,
        message: dto.message,
      },
      include: {
        sender: {
          select: {
            email: true,
            role: true,
            adminProfile: { select: { firstName: true, lastName: true } },
            talentProfile: { select: { fullName: true } },
          },
        },
      },
    });

    // Emit live chat reply event for real-time WebSocket pushing
    this.eventEmitter.emit('chat.reply', {
      enquiry,
      reply,
      senderRole,
    });

    // If Admin replies to a query, send an email notification to the user's inbox
    if (senderRole === 'ADMIN') {
      try {
        await this.mailService.sendEnquiryReplyEmail(enquiry.email, {
          fullName: enquiry.fullName,
          subject: enquiry.subject,
          message: enquiry.message,
          replyMessage: dto.message,
        });
      } catch (error: any) {
        this.logger.error(`Failed to send enquiry reply email: ${error.message}`);
      }
    }

    return reply;
  }

  async findOne(id: string) {
    const enquiry = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                email: true,
                role: true,
                adminProfile: { select: { firstName: true, lastName: true } },
                talentProfile: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    if (!enquiry) {
      throw new NotFoundException(`Enquiry with ID ${id} not found`);
    }

    return enquiry;
  }

  async findUserMessages(userId: string) {
    return this.prisma.contactMessage.findMany({
      where: { userId },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                email: true,
                role: true,
                adminProfile: { select: { firstName: true, lastName: true } },
                talentProfile: { select: { fullName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
