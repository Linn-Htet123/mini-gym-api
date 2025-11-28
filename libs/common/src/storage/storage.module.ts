import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StorageService } from './storage.service';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname.replace(
            /[^a-zA-Z0-9.-]/g,
            '_',
          );
          cb(null, `${uniqueSuffix}-${originalName}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/svg',
          'image/svg+xml',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error('Invalid file type. Only JPEG, SVG and PNG are allowed.'),
            false,
          );
        }
      },
    }),
  ],
  providers: [StorageService],
  exports: [StorageService, MulterModule],
})
export class StorageModule {}
