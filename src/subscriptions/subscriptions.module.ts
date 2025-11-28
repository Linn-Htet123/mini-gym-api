import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Member } from 'src/members/entities/member.entity';
import { MembershipPackage } from 'src/membership-packages/entities/membership-package.entity';
import { Registration } from 'src/registrations/entities/registration.entity';
import { SubscriptionSchedulerService } from './schedular/subscription-schedular.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionSchedulerService],
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      Member,
      MembershipPackage,
      Registration,
    ]),
    NotificationsModule,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
