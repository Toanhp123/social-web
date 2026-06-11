import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SecurityModule } from '@/core/security/security.module.js';
import {
  POST_FEED_CACHE,
  POST_FEED_JOB_QUEUE,
} from '@/common/constants/provider-token.constant.js';
import { QueueModule } from '@/infrastructure/queue/queue.module.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { RedisModule } from '@/infrastructure/redis/redis.module.js';
import { RealtimeModule } from '@/core/realtime/realtime.module.js';
import { MediaModule } from '@/modules/media/media.module.js';
import { NotificationsModule } from '@/modules/notifications/notifications.module.js';
import { CreatePostService } from '@/modules/posts/application/services/create-post.service.js';
import { FanOutPostFeedService } from '@/modules/posts/application/services/fan-out-post-feed.service.js';
import { ListPostsService } from '@/modules/posts/application/services/list-posts.service.js';
import { ReactToPostService } from '@/modules/posts/application/services/react-to-post.service.js';
import { SharePostService } from '@/modules/posts/application/services/share-post.service.js';
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
    DatabaseModule,
    RedisModule,
    RealtimeModule,
    NotificationsModule,
    QueueModule,
    BullModule.registerQueue({ name: POST_FEED_QUEUE_NAME }),
  ],
  controllers: [PostController],
  providers: [
    CreatePostService,
    FanOutPostFeedService,
    ListPostsService,
    ReactToPostService,
    SharePostService,
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
  exports: [PostPersistenceModule, POST_FEED_CACHE],
})
export class PostsModule {}
