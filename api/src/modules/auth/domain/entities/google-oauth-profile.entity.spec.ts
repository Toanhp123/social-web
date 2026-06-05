import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { GoogleOAuthProfile } from '@/modules/auth/domain/entities/google-oauth-profile.entity.js';
import type { OAuthProfile } from '@/modules/auth/domain/types/oauth-profile.type.js';

const googleProfile = (overrides: Partial<OAuthProfile> = {}): OAuthProfile => ({
  provider: 'GOOGLE',
  providerId: 'google-user-1',
  email: ' User@Example.COM ',
  emailVerified: true,
  name: '  User Example  ',
  avatarUrl: 'https://example.com/avatar.jpg',
  ...overrides,
});

describe('GoogleOAuthProfile', () => {
  it('creates a normalized verified Google profile', () => {
    const profile = GoogleOAuthProfile.create(googleProfile());

    expect(profile).toMatchObject({
      providerId: 'google-user-1',
      email: 'user@example.com',
      fullName: 'User Example',
    });
  });

  it('uses the email local part when Google name is missing', () => {
    const profile = GoogleOAuthProfile.create(googleProfile({ name: '   ' }));

    expect(profile.fullName).toBe('user');
  });

  it('rejects unverified Google email', () => {
    expect(() =>
      GoogleOAuthProfile.create(googleProfile({ emailVerified: false })),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.USER_EMAIL_NOT_VERIFIED,
      }),
    );
  });

  it('rejects invalid Google identity', () => {
    expect(() =>
      GoogleOAuthProfile.create(googleProfile({ providerId: '   ' })),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.INVALID_OAUTH_PROFILE,
      }),
    );
  });
});
