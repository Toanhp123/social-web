import { Module } from '@nestjs/common';
import { LoginService } from '@/modules/auth/application/services/login.service.js';
import { AuthController } from '@/modules/auth/presentation/controllers/auth.controller.js';
import { AuthOAuthController } from '@/modules/auth/presentation/controllers/auth-oauth.controller.js';
import { RegisterService } from '@/modules/auth/application/services/register.service.js';
import { RefreshTokenService } from '@/modules/auth/application/services/refresh-token.service.js';
import { LogoutService } from '@/modules/auth/application/services/logout.service.js';
import { GoogleLoginService } from '@/modules/auth/application/services/google-login.service.js';
import { AuthRequestContextFactory } from '@/modules/auth/presentation/http/auth-request-context.factory.js';
import { GoogleOAuthStateService } from '@/modules/auth/presentation/http/google-oauth-state.service.js';
import { RefreshTokenCookieService } from '@/modules/auth/presentation/http/refresh-token-cookie.service.js';
import { UserModule } from '@/modules/users/user.module.js';
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/auth-infrastructure.module.js';
import { DeviceSessionService } from '@/modules/auth/application/services/device-session.service.js';
import { SendEmailVerificationService } from '@/modules/auth/application/services/send-email-verification.service.js';
import { VerifyEmailService } from '@/modules/auth/application/services/verify-email.service.js';
import { CoreHttpModule } from '@/core/http/core-http.module.js';
import { LoggerService } from '@/core/logger/logger.service.js';
import {
  GoogleOAuthCallbackGuard,
  GoogleOAuthGuard,
} from '@/modules/auth/presentation/guards/google-oauth.guard.js';

@Module({
  imports: [AuthInfrastructureModule, UserModule, CoreHttpModule],
  controllers: [AuthController, AuthOAuthController],
  providers: [
    LoginService,
    RegisterService,
    GoogleLoginService,
    DeviceSessionService,
    SendEmailVerificationService,
    VerifyEmailService,
    RefreshTokenService,
    LogoutService,
    AuthRequestContextFactory,
    GoogleOAuthCallbackGuard,
    GoogleOAuthGuard,
    GoogleOAuthStateService,
    LoggerService,
    RefreshTokenCookieService,
  ],
})
export class AuthModule {}
