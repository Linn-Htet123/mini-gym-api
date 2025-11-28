import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Registration,
  RegistrationStatus,
} from './entities/registration.entity';
import { Member } from 'src/members/entities/member.entity';
import { MembershipPackage } from 'src/membership-packages/entities/membership-package.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { PaginatedResponseDto, PaginationDto } from '@app/common';
import { SubscriptionStatus } from 'src/subscriptions/entities/subscription.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,

    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,

    @InjectRepository(MembershipPackage)
    private readonly packageRepo: Repository<MembershipPackage>,

    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateRegistrationDto, payment_screenshot_url: string) {
    const { memberId, packageId } = dto;

    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      relations: ['user'],
    });
    if (!member) throw new NotFoundException('Member not found');

    const pack = await this.packageRepo.findOne({
      where: { id: packageId, is_active: true },
    });
    if (!pack) throw new NotFoundException('Membership package not found');

    const registration = this.registrationRepo.create({
      member,
      package: pack,
      payment_screenshot_url,
      registration_status: RegistrationStatus.PENDING,
    });

    const saved = await this.registrationRepo.save(registration);

    await this.notificationsService.create({
      userId: member.user.id,
      type: NotificationType.MEMBERSHIP_REGISTERED,
      title: 'Registration Submitted',
      message: `Your registration for the ${pack.title} package is pending admin approval.`,
      data: {
        packageId: pack.id,
        packageTitle: pack.title,
        registrationId: saved.id,
      },
    });

    await this.notificationsService.broadcastToAdmins(
      NotificationType.REGISTRATION_SUBMITTED,
      'New Registration',
      `Member ${member.name} purchased the package "${pack.title}".`,
    );

    return {
      id: saved.id,
      memberId: member.id,
      memberName: member.name,
      packageId: pack.id,
      packageTitle: pack.title,
      payment_screenshot_url,
      registration_status: saved.registration_status,
      created_at: saved.created_at,
    };
  }

  async update(id: string, dto: UpdateRegistrationDto) {
    const registration = await this.registrationRepo.findOne({
      where: { id },
      relations: ['member', 'package'],
    });
    if (!registration) throw new NotFoundException('Registration not found');

    Object.assign(registration, dto);
    const updated = await this.registrationRepo.save(registration);
    return updated;
  }
  async approveRegistration(registrationId: string) {
    const registration = await this.registrationRepo.findOne({
      where: { id: registrationId },
      relations: ['member', 'package', 'member.user'],
    });

    if (!registration) throw new NotFoundException('Registration not found');

    if (registration.registration_status === RegistrationStatus.APPROVED) {
      throw new BadRequestException('Registration is already approved');
    }

    registration.registration_status = RegistrationStatus.APPROVED;
    await this.registrationRepo.save(registration);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + registration.package.duration_days);

    const subscription = this.subscriptionsService.create({
      memberId: registration.member.id,
      packageId: registration.package.id,
      registrationId: registration.id,
      start_date: startDate,
      end_date: endDate,
      status: SubscriptionStatus.ACTIVE,
      payment_amount: registration.package.price,
      payment_screenshot_url: registration.payment_screenshot_url,
    });

    await this.notificationsService.create({
      userId: registration.member.user.id,
      type: NotificationType.REGISTRATION_APPROVED,
      title: 'Registration Approved',
      message: `Your registration for the ${registration.package.title} package has been approved. Subscription is now active.`,
    });

    await this.notificationsService.broadcastToAdmins(
      NotificationType.REGISTRATION_APPROVED,
      'Registration Approved',
      `Member ${registration.member.name} registration has been approved.`,
    );

    return { registration, subscription };
  }
  async rejectRegistration(registrationId: string, rejectionReason: string) {
    const registration = await this.registrationRepo.findOne({
      where: { id: registrationId },
      relations: ['member', 'package', 'member.user'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.registration_status === RegistrationStatus.REJECTED) {
      throw new BadRequestException('Registration is already rejected');
    }

    if (registration.registration_status === RegistrationStatus.APPROVED) {
      throw new BadRequestException('Cannot reject an approved registration');
    }

    // Update registration status and save rejection reason
    registration.registration_status = RegistrationStatus.REJECTED;
    registration.rejection_reason = rejectionReason;
    await this.registrationRepo.save(registration);

    // Notify the member
    await this.notificationsService.create({
      userId: registration.member.user.id,
      type: NotificationType.REGISTRATION_REJECTED,
      title: 'Registration Rejected',
      message: `Your registration for the ${registration.package.title} package has been rejected. Reason: ${rejectionReason}`,
      data: {
        packageId: registration.package.id,
        packageTitle: registration.package.title,
        registrationId: registration.id,
        rejectionReason: rejectionReason,
      },
    });

    // Notify admins
    await this.notificationsService.broadcastToAdmins(
      NotificationType.REGISTRATION_REJECTED,
      'Registration Rejected',
      `Registration for ${registration.member.name} - ${registration.package.title} has been rejected.`,
    );

    return {
      id: registration.id,
      memberId: registration.member.id,
      memberName: registration.member.name,
      packageId: registration.package.id,
      packageTitle: registration.package.title,
      registration_status: registration.registration_status,
      rejection_reason: registration.rejection_reason,
      created_at: registration.created_at,
    };
  }
  async findAll(queryDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, search } = queryDto;

    const query = this.registrationRepo
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.member', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('registration.package', 'package')
      .orderBy('registration.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere(
        `(
        
        member.name ILIKE :search OR 
        member.phone ILIKE :search OR 
        user.email ILIKE :search OR
        package.title ILIKE :search
      )`,
        { search: `%${search}%` },
      );
    }

    const [items, total] = await query.getManyAndCount();

    const data = items.map((reg) => this.toResponseDto(reg));

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findMyPackages(userId: string) {
    const member = await this.memberRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const registrations = await this.registrationRepo
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.member', 'member')
      .leftJoinAndSelect('registration.package', 'package')
      .where('member.id = :memberId', { memberId: member.id })
      .orderBy('registration.created_at', 'DESC')
      .getMany();

    const packages = registrations.map((reg) => {
      return {
        registration_id: reg.id,
        package: {
          id: reg.package.id,
          title: reg.package.title,
          description: reg.package.description,
          price: reg.package.price,
          duration_days: reg.package.duration_days,
        },
        registration_status: reg.registration_status,
        rejection_reason: reg.rejection_reason || null,
        payment_screenshot_url: reg.payment_screenshot_url,
        registered_at: reg.created_at,
      };
    });

    return {
      member_id: member.id,
      member_name: member.name,
      total_registrations: packages.length,
      packages,
    };
  }

  findOne(id: string) {
    return this.registrationRepo.findOne({
      where: { id },
      relations: ['member', 'package'],
    });
  }

  async remove(id: string) {
    await this.registrationRepo.delete(id);
    return { deleted: true };
  }

  private toResponseDto(registration: Registration) {
    return {
      id: registration.id,
      memberId: registration.member.id,
      memberName: registration.member.name,
      packageId: registration.package.id,
      packageTitle: registration.package.title,
      payment_screenshot_url: registration.payment_screenshot_url,
      registration_status: registration.registration_status,
      rejection_reason: registration.rejection_reason || null,
      created_at: registration.created_at,
    };
  }
}
