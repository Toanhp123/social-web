import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import {
  AUTH_ACCOUNT_REPOSITORY,
  EMAIL_SENDER,
  EMAIL_VERIFICATION_TOKEN_REPOSITORY,
  TOKEN_HASHER,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { LoggerService } from '@/core/logger/logger.service.js';
import { EmailSender } from '@/modules/auth/application/ports/email-sender.port.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { EmailVerificationTokenRepository } from '@/modules/auth/domain/repositories/email-verification-token.repository.interface.js';

export type SendEmailVerificationResult = {
  sent: boolean;
  expiresAt?: Date;
};

@Injectable()
export class SendEmailVerificationService {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY)
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,

    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async execute(authAccountId: string): Promise<SendEmailVerificationResult> {
    const account = await this.authAccountRepository.findById(authAccountId);

    if (!account) {
      throw new DomainError(ErrorCode.USER_NOT_FOUND, 'User not found', 404, {
        authAccountId,
      });
    }

    if (account.hasVerifiedEmail()) {
      return { sent: false };
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.tokenHasher.hash(token);
    const expiresAt = this.createExpiryDate();

    await this.uow.execute(async () => {
      const now = new Date();

      await this.emailVerificationTokenRepository.markUnusedByAuthAccountUsed({
        authAccountId: account.id,
        usedAt: now,
      });

      await this.emailVerificationTokenRepository.create({
        authAccountId: account.id,
        tokenHash,
        expiresAt,
      });
    });

    await this.sendEmail({
      email: account.email,
      token,
      expiresAt,
    });

    return { sent: true, expiresAt };
  }

  async executeSilently(authAccountId: string): Promise<void> {
    try {
      await this.execute(authAccountId);
    } catch (error) {
      this.logger.warn('Failed to send email verification', {
        context: 'SendEmailVerificationService',
        authAccountId,
        error,
      });
    }
  }

  private async sendEmail(input: {
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    const verificationUrl = this.createVerificationUrl(input.token);

    await this.emailSender.send({
      to: input.email,
      subject: 'Verify your Social Web email',
      text: [
        'Verify your Social Web email address by opening this link:',
        verificationUrl,
        '',
        `This link expires at ${input.expiresAt.toISOString()}.`,
      ].join('\n'),
      html: [
        '<p>Verify your Social Web email address by opening this link:</p>',
        `<p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
        `<p>This link expires at ${input.expiresAt.toISOString()}.</p>`,
      ].join(''),
    });
  }

  private createVerificationUrl(token: string): string {
    const webAppUrl = this.configService.getOrThrow<string>('oauth.webAppUrl');
    const url = new URL('/verify-email', webAppUrl);

    url.searchParams.set('token', token);

    return url.toString();
  }

  private createExpiryDate(): Date {
    const ttlMinutes =
      this.configService.get<number>('email.verificationTokenTtlMinutes') ?? 30;

    return new Date(Date.now() + ttlMinutes * 60 * 1000);
  }
}
