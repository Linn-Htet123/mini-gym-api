import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { PaginationDto, PaginatedResponseDto } from '@app/common';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
  ) {}

  async create(createDto: CreateTrainerDto): Promise<Trainer> {
    const trainer = this.trainerRepo.create(createDto);
    return await this.trainerRepo.save(trainer);
  }

  async findAll(
    queryDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Trainer>> {
    const { page = 1, limit = 10, search } = queryDto;

    const query = this.trainerRepo
      .createQueryBuilder('trainer')
      .orderBy('trainer.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere(
        `(trainer.name ILIKE :search OR trainer.specialization ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepo.findOne({ where: { id } });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return trainer;
  }

  async update(id: string, dto: UpdateTrainerDto): Promise<Trainer> {
    const trainer = await this.findOne(id);
    Object.assign(trainer, dto);
    return await this.trainerRepo.save(trainer);
  }
  async delete(id: string): Promise<{ message: string }> {
    const trainer = await this.findOne(id);
    await this.trainerRepo.remove(trainer);
    return { message: 'Trainer deleted successfully' };
  }
}
