import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class StorageService {
  handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('no file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/svg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('invalid file type');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('file is too large!');
    }

    return {
      message: 'File uploaded successfully',
      filePath: `/uploads/${file.filename}`,
    };
  }

  deleteFile(filePath: string) {
    if (!filePath) {
      console.error('No file path provided');
      return;
    }

    const relativePath = filePath.startsWith('/')
      ? filePath.slice(1)
      : filePath;
    const fullPath = join(process.cwd(), relativePath);

    if (!existsSync(fullPath)) {
      return;
    }

    try {
      unlinkSync(fullPath);
    } catch {
      console.error(`Failed to delete file: ${filePath}`);
    }
  }
}
