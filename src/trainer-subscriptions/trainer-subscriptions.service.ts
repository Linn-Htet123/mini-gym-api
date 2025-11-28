/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TrainerSubscription,
  TrainerSubscriptionStatus,
} from './entities/trainer-subscription.entity';
import { CreateTrainerSubscriptionDto } from './dto/create-trainer-subscription.dto';
import { UpdateTrainerSubscriptionDto } from './dto/update-trainer-subscription.dto';
import { Member } from 'src/members/entities/member.entity';
import { PaginatedResponseDto, PaginationDto } from '@app/common';
import { Trainer } from 'src/trainers/entities/trainer.entity';

@Injectable()
export class TrainerSubscriptionsService {
  constructor(
    @InjectRepository(TrainerSubscription)
    private readonly trainerSubRepo: Repository<TrainerSubscription>,

    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,

    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
  ) {}

  async create(dto: CreateTrainerSubscriptionDto, filePath: string) {
    const member = await this.memberRepo.findOne({
      where: { id: dto.memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    const trainer = await this.trainerRepo.findOne({
      where: { id: dto.trainerId },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const durationMonths = dto.durationMonths ?? 1;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const paymentAmount = trainer.price_per_month * durationMonths;

    const subscription = this.trainerSubRepo.create({
      member,
      trainer,
      start_date: startDate,
      end_date: endDate,
      status: TrainerSubscriptionStatus.ACTIVE,
      payment_amount: paymentAmount,
      payment_screenshot_url: filePath,
    });

    return await this.trainerSubRepo.save(subscription);
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search } = query;

    const qb = this.trainerSubRepo
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.member', 'member')
      .leftJoinAndSelect('sub.trainer', 'trainer')
      .orderBy('sub.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(`(member.name ILIKE :search OR trainer.name ILIKE :search)`, {
        search: `%${search}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();

    const data = items.map((sub) => this.toResponseDto(sub));
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const sub = await this.trainerSubRepo.findOne({
      where: { id },
      relations: ['member', 'trainer'],
    });

    if (!sub) throw new NotFoundException('Trainer Subscription not found');
    return this.toResponseDto(sub);
  }

  async update(id: string, dto: UpdateTrainerSubscriptionDto) {
    const sub = await this.trainerSubRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');

    Object.assign(sub, dto);
    return await this.trainerSubRepo.save(sub);
  }

  async remove(id: string) {
    const sub = await this.trainerSubRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');

    await this.trainerSubRepo.remove(sub);
    return { deleted: true };
  }

  async findActiveByMemberId(memberId: string) {
    return await this.trainerSubRepo.find({
      where: {
        member: { id: memberId },
        status: TrainerSubscriptionStatus.ACTIVE,
      },
      relations: ['trainer'],
    });
  }

  async expireSubscription(id: string) {
    const sub = await this.findOne(id);
    sub.status = TrainerSubscriptionStatus.EXPIRED;
    return await this.trainerSubRepo.save(sub);
  }

  async cancelSubscription(id: string) {
    const sub = await this.findOne(id);
    sub.status = TrainerSubscriptionStatus.CANCELLED;
    return await this.trainerSubRepo.save(sub);
  }

  private toResponseDto(sub: TrainerSubscription) {
    return {
      id: sub.id,
      member: {
        id: sub.member.id,
        name: sub.member.name,
        phone: sub.member.phone,
      },
      trainer: {
        id: sub.trainer.id,
        name: sub.trainer.name,
      },
      start_date: sub.start_date,
      end_date: sub.end_date,
      status: sub.status,
      payment_amount: sub.payment_amount,
      payment_screenshot_url: sub.payment_screenshot_url,
      created_at: sub.created_at,
      updated_at: sub.updated_at,
    };
  }
}
