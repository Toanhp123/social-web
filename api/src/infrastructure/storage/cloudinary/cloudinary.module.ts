import { Module } from '@nestjs/common';
import { CloudinaryService } from '@/infrastructure/storage/cloudinary/cloudinary.service.js';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
