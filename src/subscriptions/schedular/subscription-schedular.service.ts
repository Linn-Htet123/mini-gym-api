import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from '../entities/subscription.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';

@Injectable()
export class SubscriptionSchedulerService {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptions() {
    this.logger.log('Running subscription expiration check...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const expiredSubscriptions = await this.subscriptionRepo.find({
        where: {
          status: SubscriptionStatus.ACTIVE,
          end_date: LessThan(today),
        },
        relations: ['member', 'member.user', 'package'],
      });

      if (expiredSubscriptions.length === 0) {
        this.logger.log('No subscriptions to expire');
        return;
      }

      this.logger.log(
        `Found ${expiredSubscriptions.length} expired subscriptions`,
      );

      for (const subscription of expiredSubscriptions) {
        await this.expireSubscription(subscription);
        await this.notifyMemberOfExpiration(subscription);
      }

      this.logger.log(
        `Successfully expired ${expiredSubscriptions.length} subscriptions`,
      );
    } catch (error) {
      this.logger.error('Error expiring subscriptions:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async notifyExpiringSubscriptions() {
    this.logger.log('Running expiring subscription notification check...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    try {
      const expiringSubscriptions = await this.subscriptionRepo
        .createQueryBuilder('subscription')
        .leftJoinAndSelect('subscription.member', 'member')
        .leftJoinAndSelect('member.user', 'user')
        .leftJoinAndSelect('subscription.package', 'package')
        .where('subscription.status = :status', {
          status: SubscriptionStatus.ACTIVE,
        })
        .andWhere('subscription.end_date >= :today', { today })
        .andWhere('subscription.end_date <= :sevenDays', {
          sevenDays: sevenDaysFromNow,
        })
        .getMany();

      if (expiringSubscriptions.length === 0) {
        this.logger.log('No expiring subscriptions found');
        return;
      }

      this.logger.log(
        `Found ${expiringSubscriptions.length} subscriptions expiring soon`,
      );

      for (const subscription of expiringSubscriptions) {
        await this.notifyMemberOfUpcomingExpiration(subscription);
      }

      this.logger.log(
        `Sent ${expiringSubscriptions.length} expiration reminders`,
      );
    } catch (error) {
      this.logger.error('Error sending expiration notifications:', error);
    }
  }

  private async expireSubscription(subscription: Subscription): Promise<void> {
    subscription.status = SubscriptionStatus.EXPIRED;
    await this.subscriptionRepo.save(subscription);
  }

  private async notifyMemberOfExpiration(
    subscription: Subscription,
  ): Promise<void> {
    if (!subscription.member?.user) {
      return;
    }

    const daysExpired = this.calculateDaysExpired(subscription.end_date);

    await this.notificationsService.create({
      userId: subscription.member.user.id,
      type: NotificationType.SUBSCRIPTION_EXPIRED,
      title: 'Subscription Expired',
      message: `Your ${subscription.package.title} subscription has expired. Please renew to continue accessing the gym.`,
      data: {
        subscriptionId: subscription.id,
        packageTitle: subscription.package.title,
        endDate: subscription.end_date,
        daysExpired,
      },
    });

    this.logger.log(
      `Notified member ${subscription.member.name} of expired subscription`,
    );
  }

  private async notifyMemberOfUpcomingExpiration(
    subscription: Subscription,
  ): Promise<void> {
    if (!subscription.member?.user) {
      return;
    }

    const daysRemaining = this.calculateDaysRemaining(subscription.end_date);

    await this.notificationsService.create({
      userId: subscription.member.user.id,
      type: NotificationType.SUBSCRIPTION_EXPIRING,
      title: 'Subscription Expiring Soon',
      message: `Your ${subscription.package.title} subscription will expire in ${daysRemaining} day(s). Please renew soon to avoid interruption.`,
      data: {
        subscriptionId: subscription.id,
        packageTitle: subscription.package.title,
        endDate: subscription.end_date,
        daysRemaining,
      },
    });

    this.logger.log(
      `Notified member ${subscription.member.name} of expiring subscription (${daysRemaining} days)`,
    );
  }

  private calculateDaysRemaining(endDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  private calculateDaysExpired(endDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - end.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  async manualExpireCheck() {
    this.logger.log('Manual expiration check triggered');
    await this.expireSubscriptions();
    return { success: true, message: 'Expiration check completed' };
  }

  async manualExpiringCheck() {
    this.logger.log('Manual expiring notification check triggered');
    await this.notifyExpiringSubscriptions();
    return { success: true, message: 'Expiring notification check completed' };
  }
}
