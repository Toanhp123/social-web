import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { EmailAddress } from '@/core/value-objects/email-address.js';
import type { OAuthProfile } from '@/modules/auth/domain/types/oauth-profile.type.js';

export class GoogleOAuthProfile {
  private constructor(
    public readonly providerId: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly name: string | undefined,
    public readonly avatarUrl: string | undefined,
  ) {}

  static create(profile: OAuthProfile): GoogleOAuthProfile {
    if (profile.provider !== 'GOOGLE' || !profile.providerId.trim()) {
      throw new DomainError(
        ErrorCode.INVALID_OAUTH_PROFILE,
        'Invalid Google profile',
        401,
      );
    }

    const email = EmailAddress.normalizeAndValidate(profile.email);

    if (!profile.emailVerified) {
      throw new DomainError(
        ErrorCode.USER_EMAIL_NOT_VERIFIED,
        'Google email is not verified',
        403,
        { email },
      );
    }

    return new GoogleOAuthProfile(
      profile.providerId.trim(),
      email,
      this.normalizeFullName(profile.name, email),
      profile.name,
      profile.avatarUrl,
    );
  }

  private static normalizeFullName(
    name: string | undefined,
    email: string,
  ): string {
    const fullName = name?.trim();

    if (fullName) {
      return fullName;
    }

    return email.split('@')[0] || email;
  }
}
