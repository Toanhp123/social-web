import { Module } from '@nestjs/common';
import { LoginService } from './application/services/login.service.js';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './infrastructure/services/jwt.service.js';
import { RegisterService } from './application/services/register.service.js';
import {
  PASSWORD_HASHER,
  TOKEN_HASHER,
  TOKEN_SERVICE,
} from '../../common/constants/provider-token.constant.js';
import { RefreshTokenService } from './application/services/refresh-token.service.js';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service.js';
import { Sha256TokenHasher } from './infrastructure/services/sha256-token-hasher.service.js';
import { LogoutService } from './application/services/logout.service.js';
import { AuthRequestContextFactory } from './presentation/http/auth-request-context.factory.js';
import { RefreshTokenCookieService } from './presentation/http/refresh-token-cookie.service.js';
import { UserModule } from '../users/user.module.js';
import { AuthPersistenceModule } from './infrastructure/persistence/auth-persistence.module.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    AuthPersistenceModule,
    UserModule,
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
