import { Module } from '@nestjs/common';
import { AUTH_RATE_LIMITER } from '@/common/constants/provider-token.constant.js';
import { RateLimitingModule } from '@/infrastructure/rate-limiting/rate-limiting.module.js';
import { RedisAuthRateLimiter } from '@/modules/auth/infrastructure/rate-limiting/redis-auth-rate-limiter.js';

@Module({
  imports: [RateLimitingModule],
  providers: [
    {
      provide: AUTH_RATE_LIMITER,
      useClass: RedisAuthRateLimiter,
    },
  ],
  exports: [AUTH_RATE_LIMITER],
})
export class AuthRateLimitModule {}
