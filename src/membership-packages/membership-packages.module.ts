import { Module } from '@nestjs/common';
import { MembershipPackagesService } from './membership-packages.service';
import { MembershipPackagesController } from './membership-packages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPackage } from './entities/membership-package.entity';
import { Registration } from 'src/registrations/entities/registration.entity';
import { StorageModule } from '@app/common/storage/storage.module';

@Module({
  controllers: [MembershipPackagesController],
  providers: [MembershipPackagesService],
  imports: [
    TypeOrmModule.forFeature([MembershipPackage, Registration]),
    StorageModule,
  ],
})
export class MembershipPackagesModule {}
