import { Module } from '@nestjs/common';
import { RealtimeModule } from '@/core/realtime/realtime.module.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { NotificationsModule } from '@/modules/notifications/notifications.module.js';
import { PostsModule } from '@/modules/posts/posts.module.js';
import { CreateCommentService } from '@/modules/comments/application/services/create-comment.service.js';
import { ListCommentsService } from '@/modules/comments/application/services/list-comments.service.js';
import { CommentPersistenceModule } from '@/modules/comments/infrastructure/persistence/comment-persistence.module.js';
import { CommentController } from '@/modules/comments/presentation/controllers/comment.controller.js';

@Module({
  imports: [
    CommentPersistenceModule,
    DatabaseModule,
    PostsModule,
    RealtimeModule,
    NotificationsModule,
  ],
  controllers: [CommentController],
  providers: [CreateCommentService, ListCommentsService],
})
export class CommentsModule {}
