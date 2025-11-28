import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import {
  TrainerSubscription,
  TrainerSubscriptionStatus,
} from '../entities/trainer-subscription.entity';

@Injectable()
export class TrainerSubscriptionSchedulerService {
  private readonly logger = new Logger(
    TrainerSubscriptionSchedulerService.name,
  );

  constructor(
    @InjectRepository(TrainerSubscription)
    private readonly trainerSubRepo: Repository<TrainerSubscription>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireTrainerSubscriptions() {
    this.logger.log('Running trainer subscription expiration check...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredSubs = await this.trainerSubRepo.find({
      where: {
        status: TrainerSubscriptionStatus.ACTIVE,
        end_date: LessThan(today),
      },
      relations: ['member', 'member.user', 'trainer'],
    });

    if (!expiredSubs.length) {
      this.logger.log('No trainer subscriptions to expire');
      return;
    }

    this.logger.log(
      `Found ${expiredSubs.length} expired trainer subscriptions`,
    );

    for (const sub of expiredSubs) {
      await this.expireTrainerSubscription(sub);
      await this.notifyMemberOfExpiration(sub);
    }

    this.logger.log(
      `Successfully expired ${expiredSubs.length} trainer subscriptions`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async notifyExpiringTrainerSubscriptions() {
    this.logger.log(
      'Running trainer subscription expiring notification check...',
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const expiringSubs = await this.trainerSubRepo
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.member', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('sub.trainer', 'trainer')
      .where('sub.status = :status', {
        status: TrainerSubscriptionStatus.ACTIVE,
      })
      .andWhere('sub.end_date >= :today', { today })
      .andWhere('sub.end_date <= :sevenDays', { sevenDays: sevenDaysFromNow })
      .getMany();

    if (!expiringSubs.length) {
      this.logger.log('No trainer subscriptions expiring soon');
      return;
    }

    this.logger.log(
      `Found ${expiringSubs.length} trainer subscriptions expiring soon`,
    );

    for (const sub of expiringSubs) {
      await this.notifyMemberOfUpcomingExpiration(sub);
    }

    this.logger.log(
      `Sent ${expiringSubs.length} trainer subscription expiration reminders`,
    );
  }

  private async expireTrainerSubscription(sub: TrainerSubscription) {
    sub.status = TrainerSubscriptionStatus.EXPIRED;
    await this.trainerSubRepo.save(sub);
  }

  private async notifyMemberOfExpiration(sub: TrainerSubscription) {
    if (!sub.member?.user) return;

    const daysExpired = this.calculateDaysExpired(sub.end_date);

    await this.notificationsService.create({
      userId: sub.member.user.id,
      type: NotificationType.SUBSCRIPTION_EXPIRED,
      title: 'Trainer Subscription Expired',
      message: `Your subscription with trainer ${sub.trainer.name} has expired. Renew to continue your personal training sessions.`,
      data: {
        subscriptionId: sub.id,
        trainerName: sub.trainer.name,
        endDate: sub.end_date,
        daysExpired,
      },
    });

    this.logger.log(
      `Notified member ${sub.member.name} of expired trainer subscription`,
    );
  }

  private async notifyMemberOfUpcomingExpiration(sub: TrainerSubscription) {
    if (!sub.member?.user) return;

    const daysRemaining = this.calculateDaysRemaining(sub.end_date);

    await this.notificationsService.create({
      userId: sub.member.user.id,
      type: NotificationType.SUBSCRIPTION_EXPIRING,
      title: 'Trainer Subscription Expiring Soon',
      message: `Your subscription with trainer ${sub.trainer.name} will expire in ${daysRemaining} day(s). Renew soon to avoid interruption.`,
      data: {
        subscriptionId: sub.id,
        trainerName: sub.trainer.name,
        endDate: sub.end_date,
        daysRemaining,
      },
    });

    this.logger.log(
      `Notified member ${sub.member.name} of expiring trainer subscription (${daysRemaining} days)`,
    );
  }

  private calculateDaysRemaining(endDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
  }

  private calculateDaysExpired(endDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - end.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
  }

  async manualExpireCheck() {
    this.logger.log('Manual trainer subscription expiration check triggered');
    await this.expireTrainerSubscriptions();
    return {
      success: true,
      message: 'Trainer subscription expiration check completed',
    };
  }

  async manualExpiringCheck() {
    this.logger.log(
      'Manual trainer subscription expiring notification check triggered',
    );
    await this.notifyExpiringTrainerSubscriptions();
    return {
      success: true,
      message: 'Trainer subscription expiring notification check completed',
    };
  }
}
