import { Inject, Injectable } from '@nestjs/common';
import { JwtPayload } from '@/modules/auth/domain/value-objects/jwt-payload.js';
import {
  AUTH_ACCOUNT_REPOSITORY,
  AUTH_RATE_LIMITER,
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  TOKEN_SERVICE,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import type { TokenService } from '@/modules/auth/application/ports/token-service.port.js';
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { AuthSessionMetadata } from '@/modules/auth/application/types/auth-session-metadata.type.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { DeviceSessionService } from '@/modules/auth/application/services/device-session.service.js';
import type {
  AuthRateLimitInput,
  AuthRateLimiter,
} from '@/modules/auth/application/ports/auth-rate-limiter.port.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { EmailAddress } from '@/core/value-objects/email-address.js';

export type LoginContext = {
  rateLimit: AuthRateLimitInput;
  sessionMetadata?: AuthSessionMetadata;
};

@Injectable()
export class LoginService {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

    @Inject(AUTH_RATE_LIMITER)
    private readonly authRateLimiter: AuthRateLimiter,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,

    private readonly deviceSessionService: DeviceSessionService,
  ) {}

  async execute(
    email: string,
    password: string,
    context: LoginContext,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const normalizedEmail = EmailAddress.normalizeAndValidate(email);
    await this.authRateLimiter.assertAllowed({
      ...context.rateLimit,
      subject: normalizedEmail,
    });

    const sessionMetadata = context.sessionMetadata ?? {};
    const account =
      await this.authAccountRepository.findByEmail(normalizedEmail);

    if (!account) {
      throw new DomainError(
        ErrorCode.INVALID_CREDENTIALS,
        'Email or password is incorrect',
        401,
        { email: normalizedEmail },
      );
    }

    if (!(await this.passwordHasher.compare(password, account.passwordHash))) {
      throw new DomainError(
        ErrorCode.INVALID_CREDENTIALS,
        'Email or password is incorrect',
        401,
        { email: normalizedEmail },
      );
    }

    if (account.isDisabled()) {
      throw new DomainError(
        ErrorCode.USER_DISABLED,
        'User account is disabled',
        403,
        { email: normalizedEmail },
      );
    }

    const payload = JwtPayload.fromAuthAccount(account);
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);
    const refreshTokenExpiresAt = this.tokenService.getRefreshTokenExpiresAt();

    return await this.uow.execute(async () => {
      await this.deviceSessionService.replaceActiveSessionForDevice({
        authAccountId: account.id,
        sessionMetadata,
        reason: 'REPLACED_BY_LOGIN',
      });

      await this.sessionRepository.create({
        authAccountId: account.id,
        refreshTokenHash: this.tokenHasher.hash(refreshToken),
        expiresAt: refreshTokenExpiresAt,
        ...sessionMetadata,
      });

      return { accessToken, refreshToken, refreshTokenExpiresAt };
    });
  }
}
