import { Module } from '@nestjs/common';
import { TrainerSubscriptionsService } from './trainer-subscriptions.service';
import { TrainerSubscriptionsController } from './trainer-subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerSubscription } from './entities/trainer-subscription.entity';
import { Trainer } from 'src/trainers/entities/trainer.entity';
import { Member } from 'src/members/entities/member.entity';
import { StorageModule } from '@app/common/storage/storage.module';
import { TrainerSubscriptionSchedulerService } from './schedular/trainer-subscription-schedular.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainerSubscription, Trainer, Member]),
    StorageModule,
    NotificationsModule,
  ],
  controllers: [TrainerSubscriptionsController],
  providers: [TrainerSubscriptionsService, TrainerSubscriptionSchedulerService],
})
export class TrainerSubscriptionsModule {}
