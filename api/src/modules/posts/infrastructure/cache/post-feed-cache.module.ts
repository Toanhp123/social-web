import { Module } from '@nestjs/common';
import { POST_FEED_CACHE } from '@/common/constants/provider-token.constant.js';
import { RedisModule } from '@/infrastructure/redis/redis.module.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import { RedisPostFeedCache } from '@/modules/posts/infrastructure/cache/redis-post-feed-cache.js';

@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: POST_FEED_CACHE,
      useClass: RedisPostFeedCache,
    },
    PostFeedCacheInvalidationService,
  ],
  exports: [POST_FEED_CACHE, PostFeedCacheInvalidationService],
})
export class PostFeedCacheModule {}
