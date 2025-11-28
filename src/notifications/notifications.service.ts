import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from 'src/gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createDto: CreateNotificationDto) {
    const user = await this.userRepo.findOne({
      where: { id: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationRepo.create({
      user,
      type: createDto.type,
      title: createDto.title,
      message: createDto.message,
      data: createDto.data || null,
    });

    const saved = await this.notificationRepo.save(notification);

    this.notificationsGateway.emitToUser(user.id, 'notification', {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      message: saved.message,
      data: saved.data as Record<string, unknown>,
      is_read: false,
      created_at: saved.created_at,
    });

    return saved;
  }

  async findAllForUser(userId: string) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async findUnread(userId: string) {
    return this.notificationRepo.find({
      where: { user: { id: userId }, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.is_read = true;
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { user: { id: userId } },
      { is_read: true },
    );
    return { success: true };
  }

  async remove(id: string) {
    const result = await this.notificationRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { deleted: true };
  }

  async broadcastToAdmins(
    type: NotificationType,
    title: string,
    message: string,
  ) {
    const admins = await this.userRepo.find({
      where: { role: UserRole.ADMIN },
    });

    const uniqueAdmins = Array.from(
      new Map(admins.map((a) => [a.id, a])).values(),
    );
    const notifications: Notification[] = [];

    for (const admin of uniqueAdmins) {
      const record = this.notificationRepo.create({
        user: admin,
        type,
        title,
        message,
      });

      const saved = await this.notificationRepo.save(record);
      notifications.push(saved);

      this.notificationsGateway.emitToUser(admin.id, 'notification', {
        id: saved.id,
        type,
        title,
        message,
        created_at: saved.created_at,
      });
    }

    this.notificationsGateway.emitToAdmins('admin_notification', {
      type,
      title,
      message,
      created_at: new Date(),
    });

    return notifications;
  }

  broadcastToAll(message: string) {
    this.notificationsGateway.broadcast('system_announcement', {
      message,
      timestamp: new Date(),
    });

    return { success: true };
  }
}
