import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SecurityModule } from '@/core/security/security.module.js';
import {
  POST_FEED_CACHE,
  POST_FEED_JOB_QUEUE,
} from '@/common/constants/provider-token.constant.js';
import { QueueModule } from '@/infrastructure/queue/queue.module.js';
import { RedisModule } from '@/infrastructure/redis/redis.module.js';
import { MediaModule } from '@/modules/media/media.module.js';
import { CreatePostService } from '@/modules/posts/application/services/create-post.service.js';
import { ListPostsService } from '@/modules/posts/application/services/list-posts.service.js';
import { RedisPostFeedCache } from '@/modules/posts/infrastructure/cache/redis-post-feed-cache.js';
import { PostPersistenceModule } from '@/modules/posts/infrastructure/persistence/post-persistence.module.js';
import { BullMqPostFeedJobQueue } from '@/modules/posts/infrastructure/queue/bullmq-post-feed-job-queue.js';
import { PostFeedProcessor } from '@/modules/posts/infrastructure/queue/post-feed.processor.js';
import { POST_FEED_QUEUE_NAME } from '@/modules/posts/infrastructure/queue/post-feed-queue.constants.js';
import { PostController } from '@/modules/posts/presentation/controllers/post.controller.js';

@Module({
  imports: [
    PostPersistenceModule,
    SecurityModule,
    MediaModule,
    RedisModule,
    QueueModule,
    BullModule.registerQueue({ name: POST_FEED_QUEUE_NAME }),
  ],
  controllers: [PostController],
  providers: [
    CreatePostService,
    ListPostsService,
    PostFeedProcessor,
    {
      provide: POST_FEED_CACHE,
      useClass: RedisPostFeedCache,
    },
    {
      provide: POST_FEED_JOB_QUEUE,
      useClass: BullMqPostFeedJobQueue,
    },
  ],
  exports: [PostPersistenceModule],
})
export class PostsModule {}
