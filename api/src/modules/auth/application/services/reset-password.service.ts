import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_ACCOUNT_REPOSITORY,
  PASSWORD_HASHER,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { PasswordResetTokenRepository } from '@/modules/auth/domain/repositories/password-reset-token.repository.interface.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { PasswordPolicy } from '@/modules/auth/domain/policies/password.policy.js';

@Injectable()
export class ResetPasswordService {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: {
    token: string | undefined;
    password: string;
  }): Promise<void> {
    const normalizedToken = input.token?.trim();

    if (!normalizedToken) {
      this.throwInvalidToken();
    }

    PasswordPolicy.assertStrong(input.password);

    const tokenHash = this.tokenHasher.hash(normalizedToken);
    const resetToken =
      await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() <= Date.now()
    ) {
      this.throwInvalidToken();
    }

    const account = await this.authAccountRepository.findById(
      resetToken.authAccountId,
    );

    if (!account || account.isDisabled()) {
      this.throwInvalidToken();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    await this.uow.execute(async () => {
      const now = new Date();

      await this.authAccountRepository.updatePassword({
        authAccountId: account.id,
        passwordHash,
        passwordChangedAt: now,
      });

      await this.passwordResetTokenRepository.markUsed({
        id: resetToken.id,
        usedAt: now,
      });

      await this.sessionRepository.revokeActiveByAuthAccount({
        authAccountId: account.id,
        reason: 'PASSWORD_RESET',
      });
    });
  }

  private throwInvalidToken(): never {
    throw new DomainError(
      ErrorCode.INVALID_PASSWORD_RESET_TOKEN,
      'Password reset token is invalid or expired',
      400,
    );
  }
}
