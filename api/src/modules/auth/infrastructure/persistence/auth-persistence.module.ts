import { Module } from '@nestjs/common';
import {
  AUTH_ACCOUNT_REPOSITORY,
  AUTH_RATE_LIMITER,
  SESSION_REPOSITORY,
} from '../../../../common/constants/provider-token.constant.js';
import { DatabaseModule } from '../../../../infrastructure/database/database.module.js';
import { PrismaAuthAccountRepository } from './prisma-auth-account.repository.js';
import { PrismaAuthRateLimiterRepository } from './prisma-auth-rate-limiter.repository.js';
import { PrismaSessionRepository } from './prisma-session.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: AUTH_ACCOUNT_REPOSITORY,
      useClass: PrismaAuthAccountRepository,
    },
    {
      provide: AUTH_RATE_LIMITER,
      useClass: PrismaAuthRateLimiterRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
  ],
  exports: [AUTH_ACCOUNT_REPOSITORY, AUTH_RATE_LIMITER, SESSION_REPOSITORY],
})
export class AuthPersistenceModule {}
