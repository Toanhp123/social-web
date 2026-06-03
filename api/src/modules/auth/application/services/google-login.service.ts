import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  AUTH_ACCOUNT_REPOSITORY,
  AUTH_RATE_LIMITER,
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  TOKEN_SERVICE,
  UNIT_OF_WORK,
  USER_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { EmailAddress } from '@/core/value-objects/email-address.js';
import type {
  AuthRateLimitInput,
  AuthRateLimiter,
} from '@/modules/auth/application/ports/auth-rate-limiter.port.js';
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import type { TokenService } from '@/modules/auth/application/ports/token-service.port.js';
import { AuthSessionMetadata } from '@/modules/auth/application/types/auth-session-metadata.type.js';
import type { OAuthProfile } from '@/modules/auth/application/types/oauth-profile.type.js';
import { JwtPayload } from '@/modules/auth/domain/value-objects/jwt-payload.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { DeviceSessionService } from '@/modules/auth/application/services/device-session.service.js';

export type GoogleLoginContext = {
  rateLimit: AuthRateLimitInput;
  sessionMetadata?: AuthSessionMetadata;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

type NormalizedGoogleProfile = OAuthProfile & {
  email: string;
  fullName: string;
};

@Injectable()
export class GoogleLoginService {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,

    @Inject(AUTH_RATE_LIMITER)
    private readonly authRateLimiter: AuthRateLimiter,

    private readonly deviceSessionService: DeviceSessionService,
  ) {}

  async execute(
    profile: OAuthProfile,
    context: GoogleLoginContext,
  ): Promise<AuthTokens> {
    const normalizedProfile = this.normalizeProfile(profile);

    await this.authRateLimiter.assertAllowed({
      ...context.rateLimit,
      subject: normalizedProfile.email,
    });

    const sessionMetadata = context.sessionMetadata ?? {};
    const accountByOAuth = await this.authAccountRepository.findByOAuthAccount({
      provider: 'GOOGLE',
      providerId: normalizedProfile.providerId,
    });

    if (accountByOAuth) {
      this.assertAccountCanLogin(accountByOAuth);

      return await this.uow.execute(async () =>
        this.issueSession(accountByOAuth, sessionMetadata),
      );
    }

    const accountByEmail = await this.authAccountRepository.findByEmail(
      normalizedProfile.email,
    );

    if (accountByEmail) {
      this.assertAccountCanLogin(accountByEmail);

      return await this.uow.execute(async () => {
        await this.authAccountRepository.linkOAuthAccount({
          authAccountId: accountByEmail.id,
          provider: 'GOOGLE',
          providerId: normalizedProfile.providerId,
          email: normalizedProfile.email,
          name: normalizedProfile.name,
          avatarUrl: normalizedProfile.avatarUrl,
        });

        return await this.issueSession(accountByEmail, sessionMetadata);
      });
    }

    const passwordHash = await this.passwordHasher.hash(
      randomBytes(32).toString('base64url'),
    );

    return await this.uow.execute(async () => {
      const account = await this.authAccountRepository.register({
        email: normalizedProfile.email,
        passwordHash,
        role: UserRole.USER,
        emailVerifiedAt: new Date(),
      });

      await this.userRepository.create({
        id: account.id,
        fullName: normalizedProfile.fullName,
        username: null,
      });

      await this.authAccountRepository.linkOAuthAccount({
        authAccountId: account.id,
        provider: 'GOOGLE',
        providerId: normalizedProfile.providerId,
        email: normalizedProfile.email,
        name: normalizedProfile.name,
        avatarUrl: normalizedProfile.avatarUrl,
      });

      return await this.issueSession(account, sessionMetadata);
    });
  }

  private normalizeProfile(profile: OAuthProfile): NormalizedGoogleProfile {
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

    return {
      ...profile,
      email,
      fullName: this.normalizeFullName(profile.name, email),
    };
  }

  private normalizeFullName(name: string | undefined, email: string): string {
    const fullName = name?.trim();

    if (fullName) {
      return fullName;
    }

    return email.split('@')[0] || email;
  }

  private assertAccountCanLogin(account: AuthAccount): void {
    if (account.isDisabled()) {
      throw new DomainError(
        ErrorCode.USER_DISABLED,
        'User account is disabled',
        403,
        { email: account.email },
      );
    }
  }

  private async issueSession(
    account: AuthAccount,
    sessionMetadata: AuthSessionMetadata,
  ): Promise<AuthTokens> {
    const payload = JwtPayload.fromAuthAccount(account);
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);
    const refreshTokenExpiresAt = this.tokenService.getRefreshTokenExpiresAt();

    await this.deviceSessionService.replaceActiveSessionForDevice({
      authAccountId: account.id,
      sessionMetadata,
      reason: 'REPLACED_BY_OAUTH',
    });

    await this.sessionRepository.create({
      authAccountId: account.id,
      refreshTokenHash: this.tokenHasher.hash(refreshToken),
      expiresAt: refreshTokenExpiresAt,
      ...sessionMetadata,
    });

    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }
}
