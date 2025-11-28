import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Member } from 'src/members/entities/member.entity';
import { MembershipPackage } from 'src/membership-packages/entities/membership-package.entity';
import { Registration } from 'src/registrations/entities/registration.entity';
import { PaginatedResponseDto, PaginationDto } from '@app/common';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,

    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,

    @InjectRepository(MembershipPackage)
    private readonly packageRepo: Repository<MembershipPackage>,

    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const member = await this.memberRepo.findOne({
      where: { id: dto.memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    const pack = await this.packageRepo.findOne({
      where: { id: dto.packageId },
    });
    if (!pack) throw new NotFoundException('Package not found');

    const registration = await this.registrationRepo.findOne({
      where: { id: dto.registrationId },
    });
    if (!registration) throw new NotFoundException('Registration not found');

    const subscription = this.subscriptionRepo.create({
      member,
      package: pack,
      registration,
      start_date: dto.start_date,
      end_date: dto.end_date,
      status: dto.status,
      payment_amount: dto.payment_amount,
      payment_screenshot_url: dto.payment_screenshot_url,
    });

    return await this.subscriptionRepo.save(subscription);
  }

  async findAll(queryDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, search } = queryDto;

    const query = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.member', 'member')
      .leftJoinAndSelect('subscription.package', 'package')
      .leftJoinAndSelect('subscription.registration', 'registration')
      .orderBy('subscription.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere(
        `(
          member.name ILIKE :search OR 
          member.phone ILIKE :search OR
          package.title ILIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    const [items, total] = await query.getManyAndCount();
    const data = items.map((subscription) => this.toResponseDto(subscription));

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id },
      relations: ['member', 'package', 'registration'],
    });

    if (!subscription) throw new NotFoundException('Subscription not found');

    return subscription;
  }

  async update(id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.findOne(id);

    Object.assign(subscription, dto);
    return await this.subscriptionRepo.save(subscription);
  }

  async remove(id: string) {
    const subscription = await this.findOne(id);
    await this.subscriptionRepo.remove(subscription);
    return { deleted: true };
  }

  async findActiveByMemberId(memberId: string) {
    return await this.subscriptionRepo.find({
      where: {
        member: { id: memberId },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['package', 'registration'],
    });
  }

  async expireSubscription(id: string) {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.EXPIRED;
    return await this.subscriptionRepo.save(subscription);
  }

  async cancelSubscription(id: string) {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.CANCELLED;
    return await this.subscriptionRepo.save(subscription);
  }

  private toResponseDto(subscription: Subscription) {
    return {
      id: subscription.id,
      member: {
        id: subscription.member.id,
        name: subscription.member.name,
        phone: subscription.member.phone,
        address: subscription.member.address,
      },
      package: {
        id: subscription.package.id,
        title: subscription.package.title,
        description: subscription.package.description,
        price: subscription.package.price,
        duration_days: subscription.package.duration_days,
      },
      registration: {
        id: subscription.registration.id,
        registration_status: subscription.registration.registration_status,
        payment_screenshot_url:
          subscription.registration.payment_screenshot_url,
        rejection_reason: subscription.registration.rejection_reason,
      },
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      status: subscription.status,
      payment_amount: subscription.payment_amount,
      payment_screenshot_url: subscription.payment_screenshot_url,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at,
    };
  }
}
