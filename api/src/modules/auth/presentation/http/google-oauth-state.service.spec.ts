import { describe, expect, it } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { GoogleOAuthStateService } from '@/modules/auth/presentation/http/google-oauth-state.service.js';

describe('GoogleOAuthStateService', () => {
  it('creates and verifies a signed OAuth state', () => {
    const service = createService();
    const state = service.create({
      callbackUrl: '/dashboard?tab=feed',
      deviceId: 'device-1',
    });

    expect(service.verify(state)).toEqual({
      callbackUrl: '/dashboard?tab=feed',
      deviceId: 'device-1',
    });
  });

  it('rejects a tampered state', () => {
    const service = createService();
    const state = service.create({
      callbackUrl: '/dashboard',
      deviceId: 'device-1',
    });

    expect(() => service.verify(`${state}x`)).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.INVALID_OAUTH_STATE,
        statusCode: 400,
      }),
    );
  });

  it('falls back when callbackUrl is unsafe', () => {
    const service = createService();
    const state = service.create({
      callbackUrl: '//evil.example',
      deviceId: 'device-1',
    });

    expect(service.verify(state)).toEqual({
      callbackUrl: '/dashboard',
      deviceId: 'device-1',
    });
  });
});

function createService(): GoogleOAuthStateService {
  return new GoogleOAuthStateService({
    get: (key: string) => (key === 'oauth.stateSecret' ? 'state-secret' : ''),
    getOrThrow: (key: string) => {
      if (key === 'jwt.accessSecret') {
        return 'access-secret';
      }

      throw new Error(`Missing config: ${key}`);
    },
  } as unknown as ConfigService);
}
