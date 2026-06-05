import { Module } from '@nestjs/common';
import {
  POST_REACTION_REPOSITORY,
  POST_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PrismaPostReactionRepository } from '@/modules/posts/infrastructure/persistence/prisma-post-reaction.repository.js';
import { PrismaPostRepository } from '@/modules/posts/infrastructure/persistence/prisma-post.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: POST_REPOSITORY,
      useClass: PrismaPostRepository,
    },
    {
      provide: POST_REACTION_REPOSITORY,
      useClass: PrismaPostReactionRepository,
    },
  ],
  exports: [POST_REPOSITORY, POST_REACTION_REPOSITORY],
})
export class PostPersistenceModule {}
