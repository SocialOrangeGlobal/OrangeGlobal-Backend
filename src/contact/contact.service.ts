import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
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
      },
    });

    // 2. Send Notification Email
    try {
      await this.mailService.sendContactNotificationEmail(dto);
    } catch (error: any) {
      this.logger.error(`Failed to send contact notification email: ${error.message}`);
      // Don't fail the request if mail fails, as the message is already saved in the database
    }

    return {
      message: 'Your message has been submitted successfully.',
      id: savedMessage.id,
    };
  }
}
