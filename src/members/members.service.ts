import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  Subscription,
  SubscriptionStatus,
} from 'src/subscriptions/entities/subscription.entity';
import { CreateMemberDto } from './dto/create-member.dto';

import { MemberResponseDto } from './dto/member-response.dto';
import bcrypt from 'bcrypt';
import { PaginationDto, PaginatedResponseDto } from '@app/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<MemberResponseDto> {
    const { email, phone, password } = createMemberDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) throw new ConflictException('Email already registered');

    const existingMember = await this.memberRepository.findOne({
      where: { phone },
    });
    if (existingMember)
      throw new ConflictException('Phone number already registered');

    if (password && password.length < 6)
      throw new ConflictException(
        'Password must be at least 6 characters long',
      );

    const user = new User();
    user.email = email;
    user.role = UserRole.MEMBER;
    user.password_hash = await bcrypt.hash(password!, 10);

    await this.userRepository.save(user);

    const member = this.memberRepository.create({
      ...createMemberDto,
      user,
    });

    const notificationPayload = {
      userId: user.id,
      type: NotificationType.REGISTRATION_SUBMITTED,
      title: 'Welcome to the Gym!',
      message: `Hello ${member.name}, your member account has been created successfully.`,
    };
    const saved = await this.memberRepository.save(member);

    await this.notificationsService.create(notificationPayload);
    await this.notificationsService.broadcastToAdmins(
      NotificationType.REGISTRATION_SUBMITTED,
      'New Member Registration',
      `A new member, ${member.name}, has registered and is pending approval.`,
    );

    return this.toResponseDto(saved);
  }

  async findAll(
    queryDto: PaginationDto,
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    const { page = 1, limit = 10, search } = queryDto;

    const query = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.subscriptions', 'subscription')
      .leftJoinAndSelect('subscription.package', 'package')
      .orderBy('member.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere(
        `(member.name ILIKE :search OR member.phone ILIKE :search OR user.email ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [members, total] = await query.getManyAndCount();
    const data = members.map((m) => this.toResponseDto(m));

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<MemberResponseDto> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['user', 'subscriptions', 'subscriptions.package'],
    });

    if (!member) throw new NotFoundException(`Member with ID ${id} not found`);

    return this.toResponseDto(member);
  }

  async findAllWithSubscriptions(
    queryDto: PaginationDto,
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    const { page = 1, limit = 10, search } = queryDto;

    const query = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.subscriptions', 'subscription')
      .leftJoinAndSelect('subscription.package', 'package')
      .leftJoinAndSelect('member.trainerSubscriptions', 'trainerSubscription')
      .leftJoinAndSelect('trainerSubscription.trainer', 'trainer')
      .orderBy('member.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere(
        `(member.name ILIKE :search 
        OR member.phone ILIKE :search 
        OR user.email ILIKE :search
        OR trainer.name ILIKE :search
        OR package.title ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [members, total] = await query.getManyAndCount();

    const data = members.map((member) => {
      const subscriptions =
        member.subscriptions?.map((s) => ({
          id: s.id,
          packageTitle: s.package?.title,
          startDate: s.start_date,
          endDate: s.end_date,
          status: s.status,
          daysRemaining: this.calculateDaysRemaining(s.end_date),
        })) ?? [];

      const trainerSubscriptions =
        member.trainerSubscriptions?.map((ts) => ({
          id: ts.id,
          trainerName: ts.trainer?.name,
          startDate: ts.start_date,
          endDate: ts.end_date,
          status: ts.status,
          daysRemaining: this.calculateDaysRemaining(ts.end_date),
        })) ?? [];

      return {
        ...this.toResponseDto(member),
        subscriptions,
        trainerSubscriptions,
      };
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }
  private toResponseDto(member: Member): MemberResponseDto {
    const activeSubscription = member.subscriptions?.find(
      (s) => s.status === SubscriptionStatus.ACTIVE,
    );

    return {
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.user?.email,
      address: member.address,
      emergency_contact: member.emergency_contact,
      created_at: member.created_at,
      updated_at: member.updated_at,
      activeSubscription: activeSubscription
        ? {
            id: activeSubscription.id,
            packageTitle: activeSubscription.package?.title,
            startDate: activeSubscription.start_date,
            endDate: activeSubscription.end_date,
            status: activeSubscription.status,
            daysRemaining: this.calculateDaysRemaining(
              activeSubscription.end_date,
            ),
          }
        : null,
      user: member.user
        ? {
            id: member.user.id,
            email: member.user.email,
            role: member.user.role,
          }
        : undefined,
    };
  }

  private calculateDaysRemaining(endDate: Date) {
    const now = new Date();
    const diff = new Date(endDate).getTime() - now.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }
}
