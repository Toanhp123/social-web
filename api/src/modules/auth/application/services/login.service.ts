import { Inject, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.js';
import {
  AUTH_ACCOUNT_REPOSITORY,
  AUTH_RATE_LIMITER,
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  TOKEN_SERVICE,
} from './../../../../common/constants/provider-token.constant.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { DomainError } from './../../../../core/exceptions/domain.exception.js';
import type { TokenService } from '../../application/ports/token-service.port.js';
import type { PasswordHasher } from '../../application/ports/password-hasher.port.js';
import type { TokenHasher } from '../ports/token-hasher.port.js';
import { AuthSessionMetadata } from '../types/auth-session-metadata.type.js';
import { AuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { EmailAddress } from '../../../../core/value-objects/email-address.js';
import type {
  AuthRateLimitInput,
  AuthRateLimiter,
} from '../ports/auth-rate-limiter.port.js';

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
    await this.authRateLimiter.assertAllowed(context.rateLimit);

    const normalizedEmail = EmailAddress.normalizeAndValidate(email);
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

    await this.sessionRepository.create({
      authAccountId: account.id,
      refreshTokenHash: this.tokenHasher.hash(refreshToken),
      expiresAt: refreshTokenExpiresAt,
      ...sessionMetadata,
    });

    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }
}
