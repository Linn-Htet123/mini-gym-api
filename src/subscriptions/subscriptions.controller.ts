import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PaginatedResponseDto, PaginationDto } from '@app/common';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  findAll(@Query() query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    return this.subscriptionsService.findAll(query);
  }

  @Get('member/:memberId/active')
  findActiveByMember(@Param('memberId') memberId: string) {
    return this.subscriptionsService.findActiveByMemberId(memberId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Post(':id/expire')
  expire(@Param('id') id: string) {
    return this.subscriptionsService.expireSubscription(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
