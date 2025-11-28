import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { TrainerResponseDto } from './dto/trainer-response.dto';
import { PaginationDto, PaginatedResponseDto } from '@app/common';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return await this.trainersService.create(createTrainerDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<TrainerResponseDto>> {
    return await this.trainersService.findAll(query);
  }
}
