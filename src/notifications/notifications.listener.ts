import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

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
}
