import { Module } from '@nestjs/common';
import {
  AUTH_ACCOUNT_REPOSITORY,
  SESSION_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PrismaAuthAccountRepository } from '@/modules/auth/infrastructure/persistence/prisma-auth-account.repository.js';
import { PrismaSessionRepository } from '@/modules/auth/infrastructure/persistence/prisma-session.repository.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: AUTH_ACCOUNT_REPOSITORY,
      useClass: PrismaAuthAccountRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
  ],
  exports: [AUTH_ACCOUNT_REPOSITORY, SESSION_REPOSITORY, DatabaseModule],
})
export class AuthPersistenceModule {}
