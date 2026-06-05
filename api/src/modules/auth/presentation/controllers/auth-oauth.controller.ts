import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { OAUTH_SESSION_HANDOFF_STORE } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { RateLimit } from '@/core/rate-limiting/decorators/rate-limit.decorator.js';
import type { OAuthSessionHandoffStore } from '@/modules/auth/application/ports/oauth-session-handoff-store.port.js';
import { GoogleLoginService } from '@/modules/auth/application/services/google-login.service.js';
import type { OAuthProfile } from '@/modules/auth/domain/types/oauth-profile.type.js';
import { AuthResponseDto } from '@/modules/auth/presentation/dto/auth-response.dto.js';
import { OAuthSessionDto } from '@/modules/auth/presentation/dto/oauth-session.dto.js';
import {
  GoogleOAuthCallbackGuard,
  GoogleOAuthGuard,
} from '@/modules/auth/presentation/guards/google-oauth.guard.js';
import { AuthRequestContextFactory } from '@/modules/auth/presentation/http/auth-request-context.factory.js';
import {
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GoogleOAuthStateService,
} from '@/modules/auth/presentation/http/google-oauth-state.service.js';
import { RefreshTokenCookieService } from '@/modules/auth/presentation/http/refresh-token-cookie.service.js';

@Controller('auth')
export class AuthOAuthController {
  constructor(
    private readonly googleLoginService: GoogleLoginService,
    private readonly requestContextFactory: AuthRequestContextFactory,
    private readonly refreshTokenCookie: RefreshTokenCookieService,
    private readonly googleOAuthState: GoogleOAuthStateService,
    private readonly configService: ConfigService,

    @Inject(OAUTH_SESSION_HANDOFF_STORE)
    private readonly handoffStore: OAuthSessionHandoffStore,
  ) {}

  @Get('google')
  @RateLimit('auth.oauth')
  @UseGuards(GoogleOAuthGuard)
  google(): void {
    // Passport redirects to Google before this handler is called.
  }

  @Get('google/callback')
  @RateLimit('auth.oauth')
  @UseGuards(GoogleOAuthCallbackGuard)
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    res.clearCookie(
      GOOGLE_OAUTH_STATE_COOKIE_NAME,
      this.googleOAuthState.getClearCookieOptions(),
    );

    const state = this.googleOAuthState.verify(req.query.state);
    const profile = req.user as OAuthProfile | undefined;

    if (!profile) {
      throw new DomainError(
        ErrorCode.INVALID_OAUTH_PROFILE,
        'Invalid Google profile',
        401,
      );
    }

    const result = await this.googleLoginService.execute(profile, {
      rateLimit: this.requestContextFactory.createRateLimitInput(
        req,
        'oauth',
        profile.email,
      ),
      sessionMetadata: this.requestContextFactory.createSessionMetadata(req, {
        deviceId: state.deviceId,
      }),
    });
    const code = await this.handoffStore.create(result);
    const redirectUrl = new URL(
      '/auth/callback',
      this.configService.getOrThrow<string>('oauth.webAppUrl'),
    );

    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('callbackUrl', state.callbackUrl);

    res.redirect(302, redirectUrl.toString());
  }

  @Post('oauth/session')
  @RateLimit('auth.oauth')
  @HttpCode(200)
  async consumeOAuthSession(
    @Body() dto: OAuthSessionDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const payload = await this.handoffStore.consume(dto.code);

    if (!payload) {
      throw new DomainError(
        ErrorCode.INVALID_OAUTH_STATE,
        'Invalid OAuth session code',
        401,
      );
    }

    this.refreshTokenCookie.set(
      res,
      payload.refreshToken,
      payload.refreshTokenExpiresAt,
    );

    return AuthResponseDto.fromAccessToken(payload.accessToken);
  }
}
