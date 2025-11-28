import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { TrainerSubscriptionsService } from './trainer-subscriptions.service';
import { CreateTrainerSubscriptionDto } from './dto/create-trainer-subscription.dto';
import { UpdateTrainerSubscriptionDto } from './dto/update-trainer-subscription.dto';
import { PaginationDto, PaginatedResponseDto } from '@app/common';
import { StorageService } from '@app/common/storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trainer-subscriptions')
export class TrainerSubscriptionsController {
  constructor(
    private readonly trainerSubscriptionsService: TrainerSubscriptionsService,
    private readonly storageService: StorageService,
  ) {}

  @Roles(UserRole.MEMBER)
  @Post()
  @UseInterceptors(FileInterceptor('payment_screenshot'))
  create(
    @Body() dto: CreateTrainerSubscriptionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const saveFile = this.storageService.handleFileUpload(file);
    return this.trainerSubscriptionsService.create(dto, saveFile.filePath);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  findAll(@Query() query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    return this.trainerSubscriptionsService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get('member/:memberId/active')
  findActiveByMember(@Param('memberId') memberId: string) {
    return this.trainerSubscriptionsService.findActiveByMemberId(memberId);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainerSubscriptionsService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrainerSubscriptionDto) {
    return this.trainerSubscriptionsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Post(':id/expire')
  expire(@Param('id') id: string) {
    return this.trainerSubscriptionsService.expireSubscription(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.trainerSubscriptionsService.cancelSubscription(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainerSubscriptionsService.remove(id);
  }
}
