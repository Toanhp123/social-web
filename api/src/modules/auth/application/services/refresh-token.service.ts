import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import {
  AUTH_ACCOUNT_REPOSITORY,
  AUTH_RATE_LIMITER,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  TOKEN_SERVICE,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { TokenService } from '@/modules/auth/application/ports/token-service.port.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { JwtPayload } from '@/modules/auth/domain/value-objects/jwt-payload.js';
import type {
  AuthRateLimitInput,
  AuthRateLimiter,
} from '@/modules/auth/application/ports/auth-rate-limiter.port.js';

@Injectable()
export class RefreshTokenService {
  private static readonly refreshTokenFailureCodes = new Set<ErrorCode>([
    ErrorCode.INVALID_REFRESH_TOKEN,
    ErrorCode.REFRESH_TOKEN_REUSE_DETECTED,
  ]);

  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

    @Inject(AUTH_RATE_LIMITER)
    private readonly authRateLimiter: AuthRateLimiter,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,
  ) {}

  async execute(
    refreshToken: string | undefined,
    rateLimit: AuthRateLimitInput,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    await this.authRateLimiter.assertAllowed(rateLimit);

    if (!refreshToken) {
      throw new DomainError(
        ErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
        401,
      );
    }

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const currentRefreshTokenHash = this.tokenHasher.hash(refreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(
      currentRefreshTokenHash,
    );

    if (!session) {
      const isRefreshTokenReuse = await this.handleMissingCurrentSession(
        currentRefreshTokenHash,
        payload,
      );

      throw isRefreshTokenReuse
        ? this.createRefreshTokenReuseError()
        : this.createInvalidRefreshTokenError();
    }

    if (session.authAccountId !== payload.id || !session.isActive()) {
      throw new DomainError(
        ErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
        401,
      );
    }

    const account = await this.authAccountRepository.findById(payload.id);

    if (!account || account.isDisabled()) {
      throw new DomainError(
        ErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
        401,
      );
    }

    const nextPayload = JwtPayload.fromAuthAccount(account);
    const accessToken = this.tokenService.generateAccessToken(nextPayload);
    const nextRefreshToken =
      this.tokenService.generateRefreshToken(nextPayload);
    const nextRefreshTokenHash = this.tokenHasher.hash(nextRefreshToken);
    const refreshTokenExpiresAt = this.tokenService.getRefreshTokenExpiresAt();

    const rotated = await this.uow.execute(() =>
      this.sessionRepository.rotateRefreshToken({
        sessionId: session.id,
        currentRefreshTokenHash,
        currentRefreshTokenExpiresAt: session.expiresAt,
        nextRefreshTokenHash,
        nextRefreshTokenExpiresAt: refreshTokenExpiresAt,
      }),
    );

    if (!rotated) {
      await this.uow.execute(() =>
        this.revokeSessionsAfterRefreshTokenReuse(session.authAccountId),
      );

      throw this.createRefreshTokenReuseError();
    }

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      refreshTokenExpiresAt,
    };
  }

  isRefreshTokenFailure(error: unknown): boolean {
    return (
      error instanceof DomainError &&
      RefreshTokenService.refreshTokenFailureCodes.has(error.code)
    );
  }

  private async handleMissingCurrentSession(
    refreshTokenHash: string,
    payload: JwtPayload,
  ): Promise<boolean> {
    return await this.uow.execute(async () => {
      const rotatedSession =
        await this.sessionRepository.findByRotatedRefreshTokenHash(
          refreshTokenHash,
        );

      if (!rotatedSession || rotatedSession.authAccountId !== payload.id) {
        return false;
      }

      await this.revokeSessionsAfterRefreshTokenReuse(
        rotatedSession.authAccountId,
      );

      return true;
    });
  }

  private async revokeSessionsAfterRefreshTokenReuse(
    authAccountId: string,
  ): Promise<void> {
    await this.sessionRepository.revokeActiveByAuthAccount({
      authAccountId,
      reason: 'REFRESH_TOKEN_REUSE',
    });
  }

  private createInvalidRefreshTokenError(): DomainError {
    return new DomainError(
      ErrorCode.INVALID_REFRESH_TOKEN,
      'Invalid refresh token',
      401,
    );
  }

  private createRefreshTokenReuseError(): DomainError {
    return new DomainError(
      ErrorCode.REFRESH_TOKEN_REUSE_DETECTED,
      'Refresh token reuse detected',
      401,
    );
  }
}
