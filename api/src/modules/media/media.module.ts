import { Module } from '@nestjs/common';
import { MediaInfrastructureModule } from '@/modules/media/infrastructure/media-infrastructure.module.js';

@Module({
  imports: [MediaInfrastructureModule],
  exports: [MediaInfrastructureModule],
})
export class MediaModule {}
