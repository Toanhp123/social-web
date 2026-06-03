import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, type IAuthModuleOptions } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import {
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GoogleOAuthStateService,
} from '@/modules/auth/presentation/http/google-oauth-state.service.js';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly stateService: GoogleOAuthStateService,
  ) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    if (!this.isGoogleConfigured()) {
      throw new DomainError(
        ErrorCode.OAUTH_PROVIDER_NOT_CONFIGURED,
        'Google OAuth is not configured',
        503,
      );
    }

    return super.canActivate(context);
  }

  override getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const state = this.stateService.create({
      callbackUrl: this.getQueryParam(request.query.callbackUrl),
      deviceId: this.getQueryParam(request.query.deviceId),
    });

    response.cookie(
      GOOGLE_OAUTH_STATE_COOKIE_NAME,
      state,
      this.stateService.getCookieOptions(),
    );

    return {
      session: false,
      scope: ['email', 'profile'],
      state,
    };
  }

  private isGoogleConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('oauth.google.clientId') &&
      this.configService.get<string>('oauth.google.clientSecret') &&
      this.configService.get<string>('oauth.google.callbackUrl'),
    );
  }

  private getQueryParam(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return typeof value[0] === 'string' ? value[0] : undefined;
    }

    return typeof value === 'string' ? value : undefined;
  }
}

@Injectable()
export class GoogleOAuthCallbackGuard extends AuthGuard('google') {
  constructor(private readonly stateService: GoogleOAuthStateService) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    this.stateService.assertCookieMatches(
      request.cookies?.[GOOGLE_OAUTH_STATE_COOKIE_NAME],
      request.query.state,
    );

    return super.canActivate(context);
  }
}
