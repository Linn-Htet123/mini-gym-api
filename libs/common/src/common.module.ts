import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { StorageModule } from './storage/storage.module';

@Module({
  providers: [CommonService],
  exports: [CommonService],
  imports: [StorageModule],
})
export class CommonModule {}
