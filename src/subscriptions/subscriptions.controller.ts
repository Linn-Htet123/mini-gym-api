import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PaginatedResponseDto, PaginationDto } from '@app/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Roles(UserRole.MEMBER)
  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  findAll(@Query() query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    return this.subscriptionsService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get('member/:memberId/active')
  findActiveByMember(@Param('memberId') memberId: string) {
    return this.subscriptionsService.findActiveByMemberId(memberId);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Post(':id/expire')
  expire(@Param('id') id: string) {
    return this.subscriptionsService.expireSubscription(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
