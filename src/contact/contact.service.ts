import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
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

    // ─── Duplicate Submission Prevention ──────────────────────────────
    // Block same email from submitting again within 60 seconds
    const cooldownWindow = new Date(Date.now() - 60 * 1000);
    const recentSubmission = await this.prisma.contactMessage.findFirst({
      where: {
        email: dto.email,
        createdAt: { gte: cooldownWindow },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentSubmission) {
      this.logger.warn(`[SPAM] Duplicate submission blocked — email: ${dto.email}`);
      throw new ConflictException(
        'You have already submitted a message recently. Please wait a minute before trying again.',
      );
    }

    // ─── Newsletter Duplicate Prevention ─────────────────────────────
    // If subscribing to newsletter, check if this email already subscribed
    if (dto.type === 'NEWSLETTER') {
      const existingSubscription = await this.prisma.contactMessage.findFirst({
        where: {
          email: dto.email,
          type: 'NEWSLETTER',
        },
      });

      if (existingSubscription) {
        this.logger.log(`Newsletter duplicate blocked — email: ${dto.email}`);
        throw new ConflictException('This email is already subscribed to our newsletter.');
      }
    }

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
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              talentProfile: true,
              employerProfile: true,
            }
          },
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

    if (enquiry.userId && senderRole === 'ADMIN') {
      this.eventEmitter.emit('notification.send', {
        userId: enquiry.userId,
        title: 'New Message',
        message: 'You have received a new message from the Orange Global team.',
        type: 'MESSAGE',
        link: enquiry.type === 'DIRECT_MESSAGE' ? '/direct-messages' : '/contact'
      });
    }

    // If Admin replies to a query, send an email notification to the user's inbox
    if (senderRole === 'ADMIN') {
      try {
        await this.mailService.sendEnquiryReplyEmail(enquiry.email, {
          fullName: enquiry.fullName,
          subject: enquiry.subject,
          message: enquiry.message,
          replyMessage: dto.message,
          threadId: enquiry.id,
        });
      } catch (error: any) {
        this.logger.error(`Failed to send enquiry reply email: ${error.message}`);
      }
    }

    return reply;
  }

  async initiateDirectMessage(userId: string, adminId: string, message: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { talentProfile: true, employerProfile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const fullName = user.talentProfile?.fullName || user.employerProfile?.companyName || 'User';

    const enquiry = await this.prisma.contactMessage.create({
      data: {
        userId,
        fullName,
        email: user.email,
        subject: 'Chat from Orange Global',
        message: message,
        type: 'DIRECT_MESSAGE',
        status: 'PENDING',
      },
    });

    const reply = await this.prisma.contactReply.create({
      data: {
        contactMessageId: enquiry.id,
        senderId: adminId,
        senderRole: 'ADMIN',
        message: message,
      },
      include: {
        sender: {
          select: {
            email: true,
            role: true,
            adminProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    // Emit live chat reply event for real-time WebSocket pushing
    this.eventEmitter.emit('chat.reply', {
      enquiry,
      reply,
      senderRole: 'ADMIN',
    });

    this.eventEmitter.emit('notification.send', {
      userId: enquiry.userId,
      title: 'New Message',
      message: 'You have received a new message from the Orange Global team.',
      type: 'MESSAGE',
      link: '/direct-messages'
    });

    try {
      await this.mailService.sendEnquiryReplyEmail(user.email, {
        fullName: fullName,
        subject: enquiry.subject,
        message: 'Chat Message from Admin',
        replyMessage: message,
        threadId: enquiry.id,
      });
    } catch (error: any) {
      this.logger.error(`Failed to send direct message email: ${error.message}`);
    }

    return { enquiry, reply };
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

  async findUserMessages(userId: string, email: string) {
    return this.prisma.contactMessage.findMany({
      where: {
        OR: [
          { userId },
          { email }
        ]
      },
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

  async markThreadAsRead(threadId: string, userId: string, role: string) {
    // Determine condition for whose messages to mark as read
    // If admin, mark all messages where sender is NOT admin. If user, mark where sender IS admin.
    const senderCondition = role === 'ADMIN' ? { notIn: [UserRole.ADMIN] } : UserRole.ADMIN;

    const result = await this.prisma.contactReply.updateMany({
      where: {
        contactMessageId: threadId,
        senderRole: senderCondition,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    if (result.count > 0) {
      this.eventEmitter.emit('chat.read', { threadId, readBy: userId, count: result.count });
    }

    return { success: true, count: result.count };
  }

  async triggerTyping(threadId: string, userId: string, role: string, isTyping: boolean = true) {
    this.eventEmitter.emit('chat.typing', { threadId, typingBy: userId, role, isTyping });
    return { success: true };
  }
}
