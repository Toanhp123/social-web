import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import type { CookieOptions } from 'express';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

const CALLBACK_URL_FALLBACK = '/dashboard';
const BLOCKED_CALLBACK_PREFIXES = ['/login', '/register', '/auth/callback'];
const STATE_TTL_SECONDS = 5 * 60;
export const GOOGLE_OAUTH_STATE_COOKIE_NAME = 'googleOAuthState';

export type GoogleOAuthState = {
  callbackUrl: string;
  deviceId?: string;
};

type GoogleOAuthStatePayload = GoogleOAuthState & {
  exp: number;
  nonce: string;
};

@Injectable()
export class GoogleOAuthStateService {
  constructor(private readonly configService: ConfigService) {}

  create(input: Partial<GoogleOAuthState>): string {
    const payload: GoogleOAuthStatePayload = {
      callbackUrl: this.getSafeCallbackUrl(input.callbackUrl),
      exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS,
      nonce: randomUUID(),
      ...(this.getSafeDeviceId(input.deviceId)
        ? { deviceId: this.getSafeDeviceId(input.deviceId) }
        : {}),
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );

    return `${encodedPayload}.${this.sign(encodedPayload)}`;
  }

  verify(state: unknown): GoogleOAuthState {
    if (typeof state !== 'string') {
      throw this.invalidStateError();
    }

    const [encodedPayload, signature] = state.split('.');

    if (
      !encodedPayload ||
      !signature ||
      !this.isValidSignature(encodedPayload, signature)
    ) {
      throw this.invalidStateError();
    }

    const payload = this.parsePayload(encodedPayload);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw this.invalidStateError();
    }

    return {
      callbackUrl: this.getSafeCallbackUrl(payload.callbackUrl),
      ...(payload.deviceId ? { deviceId: payload.deviceId } : {}),
    };
  }

  assertCookieMatches(cookieState: unknown, queryState: unknown): void {
    if (typeof cookieState !== 'string' || typeof queryState !== 'string') {
      throw this.invalidStateError();
    }

    try {
      if (!timingSafeEqual(Buffer.from(cookieState), Buffer.from(queryState))) {
        throw this.invalidStateError();
      }
    } catch {
      throw this.invalidStateError();
    }

    this.verify(queryState);
  }

  getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('app.env') === 'production',
      sameSite: 'lax',
      path: '/auth/google/callback',
      maxAge: STATE_TTL_SECONDS * 1000,
    };
  }

  getClearCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('app.env') === 'production',
      sameSite: 'lax',
      path: '/auth/google/callback',
    };
  }

  private parsePayload(encodedPayload: string): GoogleOAuthStatePayload {
    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as Partial<GoogleOAuthStatePayload>;

      if (
        typeof payload.callbackUrl !== 'string' ||
        typeof payload.exp !== 'number' ||
        typeof payload.nonce !== 'string'
      ) {
        throw new Error('Invalid OAuth state payload');
      }

      return {
        callbackUrl: payload.callbackUrl,
        exp: payload.exp,
        nonce: payload.nonce,
        ...(this.getSafeDeviceId(payload.deviceId)
          ? { deviceId: this.getSafeDeviceId(payload.deviceId) }
          : {}),
      };
    } catch {
      throw this.invalidStateError();
    }
  }

  private isValidSignature(encodedPayload: string, signature: string): boolean {
    const expectedSignature = this.sign(encodedPayload);

    try {
      return timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch {
      return false;
    }
  }

  private sign(value: string): string {
    return createHmac('sha256', this.getStateSecret())
      .update(value)
      .digest('base64url');
  }

  private getStateSecret(): string {
    return (
      this.configService.get<string>('oauth.stateSecret') ||
      this.configService.getOrThrow<string>('jwt.accessSecret')
    );
  }

  private getSafeCallbackUrl(value: string | undefined): string {
    const trimmedValue = value?.trim();

    if (
      !trimmedValue ||
      !trimmedValue.startsWith('/') ||
      trimmedValue.startsWith('//') ||
      trimmedValue.includes('\\')
    ) {
      return CALLBACK_URL_FALLBACK;
    }

    try {
      const url = new URL(trimmedValue, 'https://app.local');
      const redirectPath = `${url.pathname}${url.search}${url.hash}`;

      if (this.isBlockedCallbackPath(redirectPath)) {
        return CALLBACK_URL_FALLBACK;
      }

      return redirectPath;
    } catch {
      return CALLBACK_URL_FALLBACK;
    }
  }

  private isBlockedCallbackPath(path: string): boolean {
    return BLOCKED_CALLBACK_PREFIXES.some(
      (blockedPath) =>
        path === blockedPath ||
        path.startsWith(`${blockedPath}?`) ||
        path.startsWith(`${blockedPath}#`) ||
        path.startsWith(`${blockedPath}/`),
    );
  }

  private getSafeDeviceId(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const deviceId = value.trim();

    if (!/^[a-zA-Z0-9._:-]{1,128}$/.test(deviceId)) {
      return undefined;
    }

    return deviceId;
  }

  private invalidStateError(): DomainError {
    return new DomainError(
      ErrorCode.INVALID_OAUTH_STATE,
      'Invalid OAuth state',
      400,
    );
  }
}
