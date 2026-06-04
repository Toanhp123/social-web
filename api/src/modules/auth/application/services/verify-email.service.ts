import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_ACCOUNT_REPOSITORY,
  EMAIL_VERIFICATION_TOKEN_REPOSITORY,
  TOKEN_HASHER,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { EmailVerificationTokenRepository } from '@/modules/auth/domain/repositories/email-verification-token.repository.interface.js';

@Injectable()
export class VerifyEmailService {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY)
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,
  ) {}

  async execute(token: string | undefined): Promise<void> {
    const normalizedToken = token?.trim();

    if (!normalizedToken) {
      this.throwInvalidToken();
    }

    const tokenHash = this.tokenHasher.hash(normalizedToken);
    const verificationToken =
      await this.emailVerificationTokenRepository.findByTokenHash(tokenHash);

    if (
      !verificationToken ||
      verificationToken.usedAt ||
      verificationToken.expiresAt.getTime() <= Date.now()
    ) {
      this.throwInvalidToken();
    }

    const account = await this.authAccountRepository.findById(
      verificationToken.authAccountId,
    );

    if (!account) {
      this.throwInvalidToken();
    }

    await this.uow.execute(async () => {
      const now = new Date();

      if (!account.hasVerifiedEmail()) {
        await this.authAccountRepository.markEmailVerified({
          authAccountId: account.id,
          verifiedAt: now,
        });
      }

      await this.emailVerificationTokenRepository.markUsed({
        id: verificationToken.id,
        usedAt: now,
      });
    });
  }

  private throwInvalidToken(): never {
    throw new DomainError(
      ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN,
      'Email verification token is invalid or expired',
      400,
    );
  }
}
