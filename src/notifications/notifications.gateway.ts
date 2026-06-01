import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as url from 'url';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  /** userId → Set of open WebSocket connections */
  private readonly userSockets: Map<string, Set<WebSocket>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: WebSocket, request: any) {
    try {
      const parsedUrl = url.parse(request?.url ?? '', true);
      const token = parsedUrl.query.token as string;

      if (!token) {
        this.logger.warn('WS rejected: No token provided');
        client.close(1008, 'Token required');
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      const userId: string = payload.sub;
      (client as any).userId = userId;

      let sockets = this.userSockets.get(userId);
      if (!sockets) {
        sockets = new Set<WebSocket>();
        this.userSockets.set(userId, sockets);
      }
      sockets.add(client);

      this.logger.log(
        `WS connected – user=${userId} sessions=${sockets.size}`,
      );
    } catch (err: any) {
      this.logger.warn(`WS auth failed: ${err?.message}`);
      client.close(1008, 'Unauthorized');
    }
  }

  handleDisconnect(client: WebSocket) {
    const userId: string | undefined = (client as any).userId;
    if (!userId) return;

    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
      this.logger.log(`WS disconnected – user=${userId}`);
    }
  }

  /** Send a notification to a single user (all their open tabs). */
  sendNotificationToUser(userId: string, notification: any): void {
    const sockets = this.userSockets.get(userId);
    if (!sockets || sockets.size === 0) {
      this.logger.log(`User ${userId} is offline – saved to DB only`);
      return;
    }

    const payload = JSON.stringify({
      event: 'new_notification',
      data: notification,
    });

    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    }
    this.logger.log(
      `Pushed notification to user=${userId} on ${sockets.size} connection(s)`,
    );
  }

  /** Send a custom event with data to a single user (all their open tabs). */
  sendEventToUser(userId: string, event: string, data: any): void {
    const sockets = this.userSockets.get(userId);
    if (!sockets || sockets.size === 0) {
      return;
    }

    const payload = JSON.stringify({
      event,
      data,
    });

    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    }
  }

  /** Broadcast a notification to every connected user. Used for job posts. */
  broadcastNotification(notification: any): void {
    const payload = JSON.stringify({
      event: 'new_notification',
      data: notification,
    });

    let count = 0;
    for (const [, sockets] of this.userSockets) {
      for (const socket of sockets) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(payload);
          count++;
        }
      }
    }
    this.logger.log(`Broadcast notification to ${count} connection(s)`);
  }
}
