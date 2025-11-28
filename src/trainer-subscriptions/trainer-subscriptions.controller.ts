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
} from '@nestjs/common';
import { TrainerSubscriptionsService } from './trainer-subscriptions.service';
import { CreateTrainerSubscriptionDto } from './dto/create-trainer-subscription.dto';
import { UpdateTrainerSubscriptionDto } from './dto/update-trainer-subscription.dto';
import { PaginationDto, PaginatedResponseDto } from '@app/common';
import { StorageService } from '@app/common/storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('trainer-subscriptions')
export class TrainerSubscriptionsController {
  constructor(
    private readonly trainerSubscriptionsService: TrainerSubscriptionsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('payment_screenshot'))
  create(
    @Body() dto: CreateTrainerSubscriptionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const saveFile = this.storageService.handleFileUpload(file);
    return this.trainerSubscriptionsService.create(dto, saveFile.filePath);
  }

  @Get()
  findAll(@Query() query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    return this.trainerSubscriptionsService.findAll(query);
  }

  @Get('member/:memberId/active')
  findActiveByMember(@Param('memberId') memberId: string) {
    return this.trainerSubscriptionsService.findActiveByMemberId(memberId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainerSubscriptionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrainerSubscriptionDto) {
    return this.trainerSubscriptionsService.update(id, dto);
  }

  @Post(':id/expire')
  expire(@Param('id') id: string) {
    return this.trainerSubscriptionsService.expireSubscription(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.trainerSubscriptionsService.cancelSubscription(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainerSubscriptionsService.remove(id);
  }
}
