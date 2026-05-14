import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(
    private loginService: LoginService,
    private registerService: RegisterService,
    private refreshTokenService: RefreshTokenService,
    private logoutService: LogoutService,
    private requestContextFactory: AuthRequestContextFactory,
    private refreshTokenCookie: RefreshTokenCookieService,
  ) {}

  @Post('login')
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
  @HttpCode(200)
  async refresh(
    @RefreshToken() refreshToken: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
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
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @RefreshToken() refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.logoutService.execute(refreshToken);
    this.refreshTokenCookie.clear(res);
  }
}
