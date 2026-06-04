import { Module } from '@nestjs/common';
import { POST_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PrismaPostRepository } from '@/modules/posts/infrastructure/persistence/prisma-post.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: POST_REPOSITORY,
      useClass: PrismaPostRepository,
    },
  ],
  exports: [POST_REPOSITORY],
})
export class PostPersistenceModule {}
