import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface BroadcastNotificationPayload {
  title: string;
  message: string;
  type?: string;
  link?: string;
}

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  /** Handles targeted notifications: one user only */
  @OnEvent('notification.send')
  async handleNotificationSendEvent(payload: CreateNotificationDto) {
    try {
      this.logger.log(
        `notification.send → userId=${payload.userId} title="${payload.title}"`,
      );
      const notification =
        await this.notificationsService.createNotification(payload);
      this.notificationsGateway.sendNotificationToUser(
        payload.userId,
        notification,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to handle notification.send: ${error?.message}`,
      );
    }
  }

  /** Handles broadcast notifications: saved for ALL talent users + WS broadcast */
  @OnEvent('notification.broadcast')
  async handleNotificationBroadcastEvent(
    payload: BroadcastNotificationPayload,
  ) {
    try {
      this.logger.log(
        `notification.broadcast → title="${payload.title}"`,
      );
      // The caller already saved DB rows; just WS-broadcast
      this.notificationsGateway.broadcastNotification({
        ...payload,
        id: 'broadcast',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to handle notification.broadcast: ${error?.message}`,
      );
    }
  }

  /** Handles real-time chat replies and corresponding notifications */
  @OnEvent('chat.reply')
  async handleChatReplyEvent(payload: { enquiry: any; reply: any; senderRole: string }) {
    try {
      const { enquiry, reply, senderRole } = payload;
      this.logger.log(`chat.reply → enquiryId=${enquiry.id} senderRole=${senderRole}`);

      if (senderRole === 'ADMIN') {
        // Reply from Admin to User/Talent. Send to the user's WS.
        if (enquiry.userId) {
          this.notificationsGateway.sendEventToUser(enquiry.userId, 'new_chat_reply', {
            enquiryId: enquiry.id,
            reply,
          });

          // Also trigger a real-time notification for the user
          await this.handleNotificationSendEvent({
            userId: enquiry.userId,
            title: '💬 New Live Chat Reply',
            message: `Orange Global Team: "${reply.message.substring(0, 60)}${reply.message.length > 60 ? '...' : ''}"`,
            type: NotificationType.MESSAGE,
            link: '/contact?type=consultation',
          });
        }
      } else {
        // Reply from User/Talent to Admin. Send to all ADMIN users' WS.
        const admins = await this.prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        for (const admin of admins) {
          this.notificationsGateway.sendEventToUser(admin.id, 'new_chat_reply', {
            enquiryId: enquiry.id,
            reply,
          });

          // Also trigger a real-time notification for admins
          await this.handleNotificationSendEvent({
            userId: admin.id,
            title: '💬 New Client Reply',
            message: `${enquiry.fullName || 'Client'}: "${reply.message.substring(0, 60)}${reply.message.length > 60 ? '...' : ''}"`,
            type: NotificationType.MESSAGE,
            link: `/messages?id=${enquiry.id}`, // Admin messages/enquiries page
          });
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to handle chat.reply: ${error?.message}`);
    }
  }
}
