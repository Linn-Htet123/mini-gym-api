import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { TrainerResponseDto } from './dto/trainer-response.dto';
import { PaginationDto, PaginatedResponseDto } from '@app/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Roles(UserRole.ADMIN)
  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return await this.trainersService.create(createTrainerDto);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<TrainerResponseDto>> {
    return await this.trainersService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<TrainerResponseDto> {
    return await this.trainersService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/update')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return await this.trainersService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.trainersService.delete(id);
  }
}
