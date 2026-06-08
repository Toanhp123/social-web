import { Module } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { RealtimeModule } from '@/core/realtime/realtime.module.js';
import { NotificationsModule } from '@/modules/notifications/notifications.module.js';
import { PostsModule } from '@/modules/posts/posts.module.js';
import { CreateCommentService } from '@/modules/comments/application/services/create-comment.service.js';
import { ListCommentsService } from '@/modules/comments/application/services/list-comments.service.js';
import { PrismaCommentRepository } from '@/modules/comments/infrastructure/persistence/prisma-comment.repository.js';
import { CommentController } from '@/modules/comments/presentation/controllers/comment.controller.js';

@Module({
  imports: [DatabaseModule, PostsModule, RealtimeModule, NotificationsModule],
  controllers: [CommentController],
  providers: [
    CreateCommentService,
    ListCommentsService,
    {
      provide: COMMENT_REPOSITORY,
      useClass: PrismaCommentRepository,
    },
  ],
})
export class CommentsModule {}
