import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CheckIn, CheckInStatus } from './entities/check-in.entity';
import { Member } from 'src/members/entities/member.entity';
import {
  Subscription,
  SubscriptionStatus,
} from 'src/subscriptions/entities/subscription.entity';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';

interface ValidationResult {
  isValid: boolean;
  status: CheckInStatus;
  denialReason: string | null;
  subscription: Subscription | null;
}

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn)
    private readonly checkInRepo: Repository<CheckIn>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async checkIn(dto: CreateCheckInDto) {
    const { memberId } = dto;

    const member = await this.findMemberWithUser(memberId);

    const validation = await this.validateMemberSubscription(memberId);

    const checkIn = await this.createCheckInRecord(
      member,
      validation.subscription,
      validation.status,
      validation.denialReason,
    );

    await this.sendCheckInNotification(member, checkIn, validation);

    return this.toResponseDto(member, checkIn, validation);
  }
  async getMemberCheckIns(memberId: string) {
    await this.findMemberWithUser(memberId);
    const checkIns = await this.checkInRepo.find({
      where: { member: { id: memberId } },
      relations: ['subscription', 'subscription.package'],
      order: { check_in_time: 'DESC' },
    });

    return checkIns.map((checkIn) => ({
      id: checkIn.id,
      check_in_status: checkIn.check_in_status,
      check_in_time: checkIn.check_in_time,
      denial_reason: checkIn.denial_reason,
      subscription: checkIn.subscription
        ? {
            package_title: checkIn.subscription.package.title,
            end_date: checkIn.subscription.end_date,
          }
        : null,
    }));
  }

  private async findMemberWithUser(memberId: string): Promise<Member> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  private async validateMemberSubscription(
    memberId: string,
  ): Promise<ValidationResult> {
    const activeSubscription = await this.findActiveSubscription(memberId);

    if (!activeSubscription) {
      return {
        isValid: false,
        status: CheckInStatus.DENIED,
        denialReason: 'No active subscription found',
        subscription: null,
      };
    }

    if (this.isSubscriptionExpired(activeSubscription.end_date)) {
      await this.expireSubscription(activeSubscription);

      return {
        isValid: false,
        status: CheckInStatus.DENIED,
        denialReason: 'Subscription expired',
        subscription: null,
      };
    }

    return {
      isValid: true,
      status: CheckInStatus.ALLOWED,
      denialReason: null,
      subscription: activeSubscription,
    };
  }

  private async findActiveSubscription(
    memberId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: {
        member: { id: memberId },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['package'],
      order: { created_at: 'DESC' },
    });
  }

  private isSubscriptionExpired(endDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    return end < today;
  }

  private async expireSubscription(subscription: Subscription): Promise<void> {
    subscription.status = SubscriptionStatus.EXPIRED;
    await this.subscriptionRepo.save(subscription);
  }

  private async createCheckInRecord(
    member: Member,
    subscription: Subscription | null,
    status: CheckInStatus,
    denialReason: string | null,
  ): Promise<CheckIn> {
    const alreadyCheckedIn = await this.validateCheckInDuplicate(member.id);

    if (alreadyCheckedIn) {
      throw new BadRequestException(
        'This member have already checked in for today',
      );
    }

    const checkIn = this.checkInRepo.create({
      member,
      subscription,
      check_in_status: status,
      denial_reason: denialReason,
    });

    return this.checkInRepo.save(checkIn);
  }

  private async validateCheckInDuplicate(memberId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingCheckIn = await this.checkInRepo.findOne({
      where: {
        check_in_status: CheckInStatus.ALLOWED,
        member: { id: memberId },
        check_in_time: Between(today, tomorrow),
      },
    });

    return !!existingCheckIn;
  }

  private async sendCheckInNotification(
    member: Member,
    checkIn: CheckIn,
    validation: ValidationResult,
  ): Promise<void> {
    if (!member.user) {
      return;
    }

    if (validation.status === CheckInStatus.DENIED) {
      await this.sendDenialNotification(
        member,
        checkIn,
        validation.denialReason!,
      );
    } else {
      await this.sendSuccessNotification(member, checkIn);
    }
  }

  private async sendDenialNotification(
    member: Member,
    checkIn: CheckIn,
    reason: string,
  ): Promise<void> {
    await this.notificationsService.create({
      userId: member.user.id,
      type: NotificationType.CHECK_IN_DENIED,
      title: 'Check-in Denied',
      message: `Your check-in was denied. Reason: ${reason}`,
      data: {
        memberId: member.id,
        checkInId: checkIn.id,
        reason,
      },
    });
  }

  private async sendSuccessNotification(
    member: Member,
    checkIn: CheckIn,
  ): Promise<void> {
    await this.notificationsService.create({
      userId: member.user.id,
      type: NotificationType.CHECK_IN_SUCCESS,
      title: 'Check-in Successful ✓',
      message: `Welcome ${member.name}! Enjoy your workout.`,
      data: {
        memberId: member.id,
        checkInId: checkIn.id,
        checkInTime: checkIn.check_in_time,
      },
    });
  }

  private toResponseDto(
    member: Member,
    checkIn: CheckIn,
    validation: ValidationResult,
  ) {
    return {
      id: checkIn.id,
      check_in_status: validation.status,
      check_in_time: checkIn.check_in_time,
      denial_reason: validation.denialReason,
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
      },
      subscription: validation.subscription
        ? {
            id: validation.subscription.id,
            package_title: validation.subscription.package.title,
            start_date: validation.subscription.start_date,
            end_date: validation.subscription.end_date,
            status: validation.subscription.status,
            days_remaining: this.calculateDaysRemaining(
              validation.subscription.end_date,
            ),
          }
        : null,
    };
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
}
