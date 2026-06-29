import { Module } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PrismaCommentRepository } from '@/modules/comments/infrastructure/persistence/prisma-comment.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: COMMENT_REPOSITORY,
      useClass: PrismaCommentRepository,
    },
  ],
  exports: [COMMENT_REPOSITORY],
})
export class CommentPersistenceModule {}
