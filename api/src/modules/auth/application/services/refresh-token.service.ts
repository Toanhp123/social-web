import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from './../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import {
  AUTH_ACCOUNT_REPOSITORY,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  TOKEN_SERVICE,
} from './../../../../common/constants/provider-token.constant.js';
import type { TokenService } from '../../application/ports/token-service.port.js';
import type { TokenHasher } from '../ports/token-hasher.port.js';
import { AuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.js';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,
  ) {}

  async execute(refreshToken: string | undefined): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
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

    if (
      !session ||
      session.authAccountId !== payload.id ||
      !session.isActive()
    ) {
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

    const rotated = await this.sessionRepository.rotateRefreshToken({
      sessionId: session.id,
      currentRefreshTokenHash,
      nextRefreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    if (!rotated) {
      throw new DomainError(
        ErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
        401,
      );
    }

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      refreshTokenExpiresAt,
    };
  }
}
