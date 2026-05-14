import { Module } from '@nestjs/common';
import { LoginService } from '@/modules/auth/application/services/login.service.js';
import { AuthController } from '@/modules/auth/presentation/controllers/auth.controller.js';
import { RegisterService } from '@/modules/auth/application/services/register.service.js';
import { RefreshTokenService } from '@/modules/auth/application/services/refresh-token.service.js';
import { LogoutService } from '@/modules/auth/application/services/logout.service.js';
import { AuthRequestContextFactory } from '@/modules/auth/presentation/http/auth-request-context.factory.js';
import { RefreshTokenCookieService } from '@/modules/auth/presentation/http/refresh-token-cookie.service.js';
import { UserModule } from '@/modules/users/user.module.js';
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/auth-infrastructure.module.js';

@Module({
  imports: [AuthInfrastructureModule, UserModule],
  controllers: [AuthController],
  providers: [
    LoginService,
    RegisterService,
    RefreshTokenService,
    LogoutService,
    AuthRequestContextFactory,
    RefreshTokenCookieService,
  ],
})
export class AuthModule {}
