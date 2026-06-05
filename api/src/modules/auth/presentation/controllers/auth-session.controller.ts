import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { RateLimit } from '@/core/rate-limiting/decorators/rate-limit.decorator.js';
import { LoginService } from '@/modules/auth/application/services/login.service.js';
import { LogoutService } from '@/modules/auth/application/services/logout.service.js';
import { RefreshTokenService } from '@/modules/auth/application/services/refresh-token.service.js';
import { RegisterService } from '@/modules/auth/application/services/register.service.js';
import { RefreshToken } from '@/modules/auth/presentation/decorators/refresh-token.decorator.js';
import { AuthResponseDto } from '@/modules/auth/presentation/dto/auth-response.dto.js';
import { LoginDto } from '@/modules/auth/presentation/dto/login.dto.js';
import { RegisterDto } from '@/modules/auth/presentation/dto/register.dto.js';
import { AuthRequestContextFactory } from '@/modules/auth/presentation/http/auth-request-context.factory.js';
import { RefreshTokenCookieService } from '@/modules/auth/presentation/http/refresh-token-cookie.service.js';

@Controller('auth')
export class AuthSessionController {
  constructor(
    private readonly loginService: LoginService,
    private readonly registerService: RegisterService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly logoutService: LogoutService,
    private readonly requestContextFactory: AuthRequestContextFactory,
    private readonly refreshTokenCookie: RefreshTokenCookieService,
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
}
