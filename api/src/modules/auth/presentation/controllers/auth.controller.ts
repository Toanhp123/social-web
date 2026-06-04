import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginService } from '@/modules/auth/application/services/login.service.js';
import { LoginDto } from '@/modules/auth/presentation/dto/login.dto.js';
import type { Request, Response } from 'express';
import { RegisterService } from '@/modules/auth/application/services/register.service.js';
import { RegisterDto } from '@/modules/auth/presentation/dto/register.dto.js';
import { RefreshTokenService } from '@/modules/auth/application/services/refresh-token.service.js';
import { RefreshToken } from '@/modules/auth/presentation/decorators/refresh-token.decorator.js';
import { AuthResponseDto } from '@/modules/auth/presentation/dto/auth-response.dto.js';
import { LogoutService } from '@/modules/auth/application/services/logout.service.js';
import { AuthRequestContextFactory } from '@/modules/auth/presentation/http/auth-request-context.factory.js';
import { RefreshTokenCookieService } from '@/modules/auth/presentation/http/refresh-token-cookie.service.js';
import { RateLimit } from '@/core/rate-limiting/decorators/rate-limit.decorator.js';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { SendEmailVerificationService } from '@/modules/auth/application/services/send-email-verification.service.js';
import { VerifyEmailService } from '@/modules/auth/application/services/verify-email.service.js';
import { SendEmailVerificationResponseDto } from '@/modules/auth/presentation/dto/send-email-verification-response.dto.js';
import { VerifyEmailDto } from '@/modules/auth/presentation/dto/verify-email.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private loginService: LoginService,
    private registerService: RegisterService,
    private refreshTokenService: RefreshTokenService,
    private logoutService: LogoutService,
    private sendEmailVerificationService: SendEmailVerificationService,
    private verifyEmailService: VerifyEmailService,
    private requestContextFactory: AuthRequestContextFactory,
    private refreshTokenCookie: RefreshTokenCookieService,
  ) {}

  @Post('login')
  @RateLimit('auth.login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await this.loginService.execute(loginDto.email, loginDto.password, {
        rateLimit: this.requestContextFactory.createRateLimitInput(
          req,
          'login',
          loginDto.email,
        ),
        sessionMetadata: this.requestContextFactory.createSessionMetadata(req),
      });

    this.refreshTokenCookie.set(res, refreshToken, refreshTokenExpiresAt);

    return AuthResponseDto.fromAccessToken(accessToken);
  }

  @Post('register')
  @RateLimit('auth.register')
  @HttpCode(201)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await this.registerService.execute(registerDto, {
        rateLimit: this.requestContextFactory.createRateLimitInput(
          req,
          'register',
          registerDto.email,
        ),
        sessionMetadata: this.requestContextFactory.createSessionMetadata(req),
      });

    this.refreshTokenCookie.set(res, refreshToken, refreshTokenExpiresAt);

    return AuthResponseDto.fromAccessToken(accessToken);
  }

  @Post('refresh')
  @RateLimit('auth.refresh')
  @HttpCode(200)
  async refresh(
    @RefreshToken() refreshToken: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    try {
      const {
        accessToken,
        refreshToken: nextRefreshToken,
        refreshTokenExpiresAt,
      } = await this.refreshTokenService.execute(
        refreshToken,
        this.requestContextFactory.createRateLimitInput(req, 'refresh'),
      );

      this.refreshTokenCookie.set(res, nextRefreshToken, refreshTokenExpiresAt);

      return AuthResponseDto.fromAccessToken(accessToken);
    } catch (error) {
      if (this.refreshTokenService.isRefreshTokenFailure(error)) {
        this.refreshTokenCookie.clear(res);
      }

      throw error;
    }
  }

  @Post('logout')
  @RateLimit('auth.logout')
  @HttpCode(204)
  async logout(
    @RefreshToken() refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.logoutService.execute(refreshToken);
    this.refreshTokenCookie.clear(res);
  }

  @Post('email-verification/send')
  @UseGuards(JwtAuthGuard)
  @RateLimit('auth.emailVerification.send')
  @HttpCode(200)
  async sendEmailVerification(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SendEmailVerificationResponseDto> {
    const result = await this.sendEmailVerificationService.execute(user.userId);

    return SendEmailVerificationResponseDto.fromResult(result);
  }

  @Post('email-verification/verify')
  @RateLimit('auth.emailVerification.verify')
  @HttpCode(204)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    await this.verifyEmailService.execute(dto.token);
  }
}
