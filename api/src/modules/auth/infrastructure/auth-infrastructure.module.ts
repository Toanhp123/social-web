import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { OAUTH_SESSION_HANDOFF_STORE } from '@/common/constants/provider-token.constant.js';
import { RedisModule } from '@/infrastructure/redis/redis.module.js';
import { EmailModule } from '@/infrastructure/email/email.module.js';
import { AuthPersistenceModule } from '@/modules/auth/infrastructure/persistence/auth-persistence.module.js';
import { AuthRateLimitModule } from '@/modules/auth/infrastructure/rate-limiting/auth-rate-limit.module.js';
import { RedisOAuthSessionHandoffStore } from '@/modules/auth/infrastructure/services/redis-oauth-session-handoff-store.service.js';
import { AuthSecurityModule } from '@/modules/auth/infrastructure/services/auth-security.module.js';
import { GoogleStrategy } from '@/modules/auth/infrastructure/strategies/google.strategy.js';
import { JwtStrategy } from '@/modules/auth/infrastructure/strategies/jwt.strategy.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    RedisModule,
    EmailModule,
    AuthPersistenceModule,
    AuthRateLimitModule,
    AuthSecurityModule,
  ],
  providers: [
    JwtStrategy,
    GoogleStrategy,
    {
      provide: OAUTH_SESSION_HANDOFF_STORE,
      useClass: RedisOAuthSessionHandoffStore,
    },
  ],
  exports: [
    AuthPersistenceModule,
    AuthRateLimitModule,
    OAUTH_SESSION_HANDOFF_STORE,
    AuthSecurityModule,
    EmailModule,
  ],
})
export class AuthInfrastructureModule {}
