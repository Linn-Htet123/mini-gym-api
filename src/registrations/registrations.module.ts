import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { Member } from 'src/members/entities/member.entity';
import { MembershipPackage } from 'src/membership-packages/entities/membership-package.entity';
import { User } from 'src/users/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { StorageModule } from '@app/common/storage/storage.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  imports: [
    TypeOrmModule.forFeature([Registration, Member, MembershipPackage, User]),
    NotificationsModule,
    SubscriptionsModule,
    StorageModule,
  ],
})
export class RegistrationsModule {}
