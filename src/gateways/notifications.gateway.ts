/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Notification } from 'src/notifications/entities/notification.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export type NotificationPayload = Partial<Notification>;

interface UserPayload {
  userId: string;
  role: string;
  sub: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>();

  constructor(private jwtService: JwtService) {
    this.logger.log('🔌 NotificationsGateway initialized');
  }

  afterInit(server: Server): void {
    this.logger.log('🚀 WebSocket Gateway initialized successfully', server);
    this.logger.log(`📡 Listening on namespace: /notifications`);
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    this.logger.log(`🔗 New connection attempt: ${client.id}`);

    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1] ||
        (client.handshake.query?.token as string);

      this.logger.log(`Token present: ${!!token}`);

      if (token) {
        try {
          const payload: UserPayload = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET || 'your-secret-key',
          });

          client.userId = payload.sub || payload.userId;
          client.userRole = payload.role;

          this.connectedUsers.set(client.userId, client.id);
          await client.join(`user:${client.userId}`);

          if (client.userRole === 'admin') {
            await client.join('admins');
            this.logger.log(`Admin joined: ${client.userId}`);
          }

          this.logger.log(
            ` Authenticated: ${client.id} (User: ${client.userId}, Role: ${client.userRole})`,
          );
        } catch (error) {
          this.logger.warn(
            `Invalid token for ${client.id}: ${error instanceof Error ? error.message : 'Unknown'}`,
          );
          client.userId = `guest-${client.id}`;
          client.userRole = 'guest';
        }
      } else {
        this.logger.log(`👤 Guest connection: ${client.id}`);
        client.userId = `guest-${client.id}`;
        client.userRole = 'guest';
        await client.join('guests');
      }

      this.logger.log(`Total connections: ${this.connectedUsers.size}`);

      client.emit('connected', {
        message: 'Successfully connected to notification service',
        userId: client.userId,
        role: client.userRole,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        `Connection error for ${client.id}:`,
        error instanceof Error ? error.stack : error,
      );
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`👋 User disconnected: ${client.userId}`);
    }
    this.logger.log(`🔌 Client disconnected: ${client.id}`);
    this.logger.log(`📊 Total connections: ${this.connectedUsers.size}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket): { pong: string } {
    this.logger.log(`🏓 Ping from ${client.id}`);
    this.server.emit('pong', { timestamp: new Date().toISOString() });
    return { pong: 'pong' };
  }

  emitToUser(userId: string, event: string, data: NotificationPayload): void {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.log(`📤 Notification sent to user ${userId}: ${event}`);
  }

  emitToAdmins(event: string, data: NotificationPayload): void {
    this.server.to('admins').emit(event, data);
    this.logger.log(`📤 Notification sent to all admins: ${event}`);
  }

  broadcast(event: string, data: unknown): void {
    this.server.emit(event, data);
    this.logger.log(`📢 Broadcast: ${event}`);
  }
}
