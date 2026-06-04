import { Module } from '@nestjs/common';
import {
  AUTH_ACCOUNT_REPOSITORY,
  EMAIL_VERIFICATION_TOKEN_REPOSITORY,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  SESSION_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { PrismaAuthAccountRepository } from '@/modules/auth/infrastructure/persistence/prisma-auth-account.repository.js';
import { PrismaEmailVerificationTokenRepository } from '@/modules/auth/infrastructure/persistence/prisma-email-verification-token.repository.js';
import { PrismaPasswordResetTokenRepository } from '@/modules/auth/infrastructure/persistence/prisma-password-reset-token.repository.js';
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
    {
      provide: EMAIL_VERIFICATION_TOKEN_REPOSITORY,
      useClass: PrismaEmailVerificationTokenRepository,
    },
    {
      provide: PASSWORD_RESET_TOKEN_REPOSITORY,
      useClass: PrismaPasswordResetTokenRepository,
    },
  ],
  exports: [
    AUTH_ACCOUNT_REPOSITORY,
    SESSION_REPOSITORY,
    EMAIL_VERIFICATION_TOKEN_REPOSITORY,
    PASSWORD_RESET_TOKEN_REPOSITORY,
    DatabaseModule,
  ],
})
export class AuthPersistenceModule {}
