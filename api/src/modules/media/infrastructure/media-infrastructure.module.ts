import { Module } from '@nestjs/common';
import { FILE_STORAGE } from '@/common/constants/provider-token.constant.js';
import { CloudinaryModule } from '@/infrastructure/storage/cloudinary/cloudinary.module.js';
import { CloudinaryFileStorageAdapter } from '@/modules/media/infrastructure/storage/cloudinary-file-storage.adapter.js';

@Module({
  imports: [CloudinaryModule],
  providers: [
    {
      provide: FILE_STORAGE,
      useClass: CloudinaryFileStorageAdapter,
    },
  ],
  exports: [FILE_STORAGE],
})
export class MediaInfrastructureModule {}
