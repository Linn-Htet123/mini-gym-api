import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { PaginationDto, PaginatedResponseDto } from '@app/common';

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
}
