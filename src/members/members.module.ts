import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { Member } from './entities/member.entity';
import { User } from 'src/users/entities/user.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, User, Subscription]),
    NotificationsModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
