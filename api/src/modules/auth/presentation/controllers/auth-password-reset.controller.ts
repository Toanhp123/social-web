import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { RateLimit } from '@/core/rate-limiting/decorators/rate-limit.decorator.js';
import { RequestPasswordResetService } from '@/modules/auth/application/services/request-password-reset.service.js';
import { ResetPasswordService } from '@/modules/auth/application/services/reset-password.service.js';
import { RequestPasswordResetResponseDto } from '@/modules/auth/presentation/dto/request-password-reset-response.dto.js';
import { RequestPasswordResetDto } from '@/modules/auth/presentation/dto/request-password-reset.dto.js';
import { ResetPasswordDto } from '@/modules/auth/presentation/dto/reset-password.dto.js';
import { AuthRequestContextFactory } from '@/modules/auth/presentation/http/auth-request-context.factory.js';

@Controller('auth/password-reset')
export class AuthPasswordResetController {
  constructor(
    private readonly requestPasswordResetService: RequestPasswordResetService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly requestContextFactory: AuthRequestContextFactory,
  ) {}

  @Post('request')
  @RateLimit('auth.passwordReset.request')
  @HttpCode(200)
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
    @Req() req: Request,
  ): Promise<RequestPasswordResetResponseDto> {
    await this.requestPasswordResetService.execute(dto.email, {
      rateLimit: this.requestContextFactory.createRateLimitInput(
        req,
        'resetPassword',
        dto.email,
      ),
    });

    return RequestPasswordResetResponseDto.create();
  }

  @Post('confirm')
  @RateLimit('auth.passwordReset.confirm')
  @HttpCode(204)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.resetPasswordService.execute(dto);
  }
}
