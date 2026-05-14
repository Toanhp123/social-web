import { Module } from '@nestjs/common';
import { LoginService } from '@/modules/auth/application/services/login.service.js';
import { AuthController } from '@/modules/auth/presentation/controllers/auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@/modules/auth/infrastructure/strategies/jwt.strategy.js';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@/modules/auth/infrastructure/services/jwt.service.js';
import { RegisterService } from '@/modules/auth/application/services/register.service.js';
import {
  PASSWORD_HASHER,
  TOKEN_HASHER,
  TOKEN_SERVICE,
} from '@/common/constants/provider-token.constant.js';
import { RefreshTokenService } from '@/modules/auth/application/services/refresh-token.service.js';
import { BcryptPasswordHasher } from '@/modules/auth/infrastructure/services/bcrypt-password-hasher.service.js';
import { Sha256TokenHasher } from '@/modules/auth/infrastructure/services/sha256-token-hasher.service.js';
import { LogoutService } from '@/modules/auth/application/services/logout.service.js';
import { AuthRequestContextFactory } from '@/modules/auth/presentation/http/auth-request-context.factory.js';
import { RefreshTokenCookieService } from '@/modules/auth/presentation/http/refresh-token-cookie.service.js';
import { UserModule } from '@/modules/users/user.module.js';
import { AuthPersistenceModule } from '@/modules/auth/infrastructure/persistence/auth-persistence.module.js';

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
