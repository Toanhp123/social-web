import { Module } from '@nestjs/common';
import { PrismaAuthAccountRepository } from './infrastructure/persistence/prisma-auth-account.repository.js';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma-session.repository.js';
import { LoginService } from './application/services/login.service.js';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './infrastructure/services/jwt.service.js';
import { RegisterService } from './application/services/register.service.js';
import {
  AUTH_ACCOUNT_REPOSITORY,
  AUTH_RATE_LIMITER,
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  TOKEN_SERVICE,
} from '../../common/constants/provider-token.constant.js';
import { RefreshTokenService } from './application/services/refresh-token.service.js';
import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service.js';
import { Sha256TokenHasher } from './infrastructure/services/sha256-token-hasher.service.js';
import { LogoutService } from './application/services/logout.service.js';
import { PrismaAuthRateLimiterRepository } from './infrastructure/persistence/prisma-auth-rate-limiter.repository.js';
import { AuthRequestContextFactory } from './presentation/http/auth-request-context.factory.js';
import { RefreshTokenCookieService } from './presentation/http/refresh-token-cookie.service.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    LoginService,
    RegisterService,
    RefreshTokenService,
    LogoutService,
    AuthRequestContextFactory,
    RefreshTokenCookieService,
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
    {
      provide: TOKEN_SERVICE,
      useClass: JwtService,
    },
    {
      provide: TOKEN_HASHER,
      useClass: Sha256TokenHasher,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    JwtStrategy,
  ],
  exports: [JwtStrategy],
})
export class AuthModule {}
