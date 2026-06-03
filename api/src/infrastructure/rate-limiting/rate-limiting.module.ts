import { Module } from '@nestjs/common';
import { RATE_LIMITER } from '@/common/constants/provider-token.constant.js';
import { RedisModule } from '@/infrastructure/redis/redis.module.js';
import { RedisRateLimiter } from '@/infrastructure/rate-limiting/redis-rate-limiter.js';

@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: RATE_LIMITER,
      useClass: RedisRateLimiter,
    },
  ],
  exports: [RATE_LIMITER],
})
export class RateLimitingModule {}
