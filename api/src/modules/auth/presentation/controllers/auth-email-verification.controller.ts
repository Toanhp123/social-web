import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { RateLimit } from '@/core/rate-limiting/decorators/rate-limit.decorator.js';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { SendEmailVerificationService } from '@/modules/auth/application/services/send-email-verification.service.js';
import { VerifyEmailService } from '@/modules/auth/application/services/verify-email.service.js';
import { SendEmailVerificationResponseDto } from '@/modules/auth/presentation/dto/send-email-verification-response.dto.js';
import { VerifyEmailDto } from '@/modules/auth/presentation/dto/verify-email.dto.js';

@Controller('auth/email-verification')
export class AuthEmailVerificationController {
  constructor(
    private readonly sendEmailVerificationService: SendEmailVerificationService,
    private readonly verifyEmailService: VerifyEmailService,
  ) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @RateLimit('auth.emailVerification.send')
  @HttpCode(200)
  async sendEmailVerification(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SendEmailVerificationResponseDto> {
    const result = await this.sendEmailVerificationService.execute(user.userId);

    return SendEmailVerificationResponseDto.fromResult(result);
  }

  @Post('verify')
  @RateLimit('auth.emailVerification.verify')
  @HttpCode(204)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    await this.verifyEmailService.execute(dto.token);
  }
}
