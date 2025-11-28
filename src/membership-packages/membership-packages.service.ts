import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMembershipPackageDto } from './dto/create-membership-package.dto';
import { UpdateMembershipPackageDto } from './dto/update-membership-package.dto';
import { MembershipPackage } from './entities/membership-package.entity';
import { PaginatedResponseDto, PaginationDto } from '@app/common';
import { MembershipPackageResponseDto } from './dto/membership-package-response.dto';
import { UpdateMembershipPackageStatusDto } from './dto/update-membership-package-status.dto';

@Injectable()
export class MembershipPackagesService {
  constructor(
    @InjectRepository(MembershipPackage)
    private readonly membershipRepo: Repository<MembershipPackage>,
  ) {}

  async create(dto: CreateMembershipPackageDto) {
    const entity = this.membershipRepo.create(dto);
    return await this.membershipRepo.save(entity);
  }

  async findAll(
    queryDto: PaginationDto,
  ): Promise<PaginatedResponseDto<MembershipPackageResponseDto>> {
    const { page = 1, limit = 10, search } = queryDto;

    const query = this.membershipRepo
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.registrations', 'registrations')
      .leftJoinAndSelect('package.subscriptions', 'subscriptions')
      .orderBy('package.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere(
        `(package.title ILIKE :search OR package.description ILIKE :search OR package.price::text ILIKE :search OR package.duration_days::text ILIKE :search OR package.is_active::text ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [items, total] = await query.getManyAndCount();

    const data = items.map((p) => this.toResponseDto(p));

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findAllActive(
    queryDto: PaginationDto,
  ): Promise<PaginatedResponseDto<MembershipPackageResponseDto>> {
    const { page = 1, limit = 10, search } = queryDto;

    const query = this.membershipRepo
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.registrations', 'registrations')
      .leftJoinAndSelect('package.subscriptions', 'subscriptions')
      .where('package.is_active = :active', { active: true })
      .orderBy('package.created_at', 'DESC');

    if (search) {
      query.andWhere(
        `(package.title ILIKE :search 
      OR package.description ILIKE :search 
      OR package.price::text ILIKE :search 
      OR package.duration_days::text ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    query.skip((page - 1) * limit).take(limit);

    const [items, total] = await query.getManyAndCount();

    const data = items.map((p) => this.toResponseDto(p));

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const item = await this.membershipRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Membership package not found');
    return item;
  }

  async update(id: string, dto: UpdateMembershipPackageDto) {
    const existing = await this.findOne(id);
    const updated = Object.assign(existing, dto);
    return await this.membershipRepo.save(updated);
  }

  async updateStatus(id: string, dto: UpdateMembershipPackageStatusDto) {
    const existing = await this.findOne(id);
    existing.is_active = dto.is_active;
    return await this.membershipRepo.save(existing);
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    await this.membershipRepo.remove(existing);
    return { message: 'Deleted successfully' };
  }

  private toResponseDto(
    entity: MembershipPackage,
  ): MembershipPackageResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      price: Number(entity.price),
      duration_days: entity.duration_days,
      is_active: entity.is_active,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      registration_count: entity.registrations
        ? entity.registrations.length
        : 0,
      subscription_count: entity.subscriptions
        ? entity.subscriptions.length
        : 0,
    };
  }
}
