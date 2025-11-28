import { Module } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn } from './entities/check-in.entity';
import { Member } from 'src/members/entities/member.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
@Module({
  controllers: [CheckInsController],
  providers: [CheckInsService],
  imports: [
    TypeOrmModule.forFeature([CheckIn, Member, Subscription]),
    NotificationsModule,
  ],
})
export class CheckInsModule {}
