import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import {
  AUTH_ACCOUNT_REPOSITORY,
  AUTH_RATE_LIMITER,
  EMAIL_SENDER,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  TOKEN_HASHER,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { LoggerService } from '@/core/logger/logger.service.js';
import { EmailAddress } from '@/core/value-objects/email-address.js';
import type {
  AuthRateLimitInput,
  AuthRateLimiter,
} from '@/modules/auth/application/ports/auth-rate-limiter.port.js';
import { EmailSender } from '@/modules/auth/application/ports/email-sender.port.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { PasswordResetTokenRepository } from '@/modules/auth/domain/repositories/password-reset-token.repository.interface.js';

export type RequestPasswordResetContext = {
  rateLimit: AuthRateLimitInput;
};

export type RequestPasswordResetResult = {
  sent: true;
};

@Injectable()
export class RequestPasswordResetService {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,

    @Inject(AUTH_RATE_LIMITER)
    private readonly authRateLimiter: AuthRateLimiter,

    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    email: string,
    context: RequestPasswordResetContext,
  ): Promise<RequestPasswordResetResult> {
    const normalizedEmail = EmailAddress.normalizeAndValidate(email);

    await this.authRateLimiter.assertAllowed({
      ...context.rateLimit,
      action: 'resetPassword',
      subject: normalizedEmail,
    });

    const account =
      await this.authAccountRepository.findByEmail(normalizedEmail);

    if (!account || account.isDisabled()) {
      return { sent: true };
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.tokenHasher.hash(token);
    const expiresAt = this.createExpiryDate();

    await this.uow.execute(async () => {
      const now = new Date();

      await this.passwordResetTokenRepository.markUnusedByAuthAccountUsed({
        authAccountId: account.id,
        usedAt: now,
      });

      await this.passwordResetTokenRepository.create({
        authAccountId: account.id,
        tokenHash,
        expiresAt,
      });
    });

    await this.sendEmailSilently({
      email: account.email,
      token,
      expiresAt,
    });

    return { sent: true };
  }

  private async sendEmailSilently(input: {
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    try {
      const resetUrl = this.createResetUrl(input.token);

      await this.emailSender.send({
        to: input.email,
        subject: 'Reset your Social Web password',
        text: [
          'Reset your Social Web password by opening this link:',
          resetUrl,
          '',
          `This link expires at ${input.expiresAt.toISOString()}.`,
        ].join('\n'),
        html: [
          '<p>Reset your Social Web password by opening this link:</p>',
          `<p><a href="${resetUrl}">${resetUrl}</a></p>`,
          `<p>This link expires at ${input.expiresAt.toISOString()}.</p>`,
        ].join(''),
      });
    } catch (error) {
      this.logger.warn('Failed to send password reset email', {
        context: 'RequestPasswordResetService',
        email: input.email,
        error,
      });
    }
  }

  private createResetUrl(token: string): string {
    const webAppUrl = this.configService.getOrThrow<string>('oauth.webAppUrl');
    const url = new URL('/reset-password', webAppUrl);

    url.searchParams.set('token', token);

    return url.toString();
  }

  private createExpiryDate(): Date {
    const ttlMinutes =
      this.configService.get<number>('email.passwordResetTokenTtlMinutes') ??
      30;

    return new Date(Date.now() + ttlMinutes * 60 * 1000);
  }
}
