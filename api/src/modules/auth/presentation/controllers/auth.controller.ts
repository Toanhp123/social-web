import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginService } from '../../application/services/login.service.js';
import { LoginDto } from '../dto/login.dto.js';
import type { Request, Response } from 'express';
import { RegisterService } from '../../application/services/register.service.js';
import { RegisterDto } from '../dto/register.dto.js';
import { RefreshTokenService } from '../../application/services/refresh-token.service.js';
import { RefreshToken } from '../decorators/refresh-token.decorator.js';
import { AuthResponseDto } from '../dto/auth-response.dto.js';
import { LogoutService } from '../../application/services/logout.service.js';
import { AuthSessionMetadata } from '../../application/types/auth-session-metadata.type.js';

@Controller('auth')
export class AuthController {
  constructor(
    private loginService: LoginService,
    private registerService: RegisterService,
    private refreshTokenService: RefreshTokenService,
    private logoutService: LogoutService,
    private configService: ConfigService,
  ) {}

  private setRefreshTokenCookie(
    res: Response,
    refreshToken: string,
    expiresAt: Date,
  ) {
    const isProduction =
      this.configService.get<string>('app.env') === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/auth',
      expires: expiresAt,
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    const isProduction =
      this.configService.get<string>('app.env') === 'production';

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/auth',
    });
  }

  private getSessionMetadata(req: Request): AuthSessionMetadata {
    const deviceId = req.header('x-device-id')?.trim();
    const device = req.header('x-device-name')?.trim();

    return {
      ip: req.ip,
      userAgent: req.header('user-agent'),
      ...(deviceId ? { deviceId } : {}),
      ...(device ? { device } : {}),
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await this.loginService.execute(
        loginDto.email,
        loginDto.password,
        this.getSessionMetadata(req),
      );

    this.setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresAt);

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
      await this.registerService.execute(
        registerDto,
        this.getSessionMetadata(req),
      );

    this.setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresAt);

    return AuthResponseDto.fromAccessToken(accessToken);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @RefreshToken() refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const {
      accessToken,
      refreshToken: nextRefreshToken,
      refreshTokenExpiresAt,
    } = await this.refreshTokenService.execute(refreshToken);

    this.setRefreshTokenCookie(res, nextRefreshToken, refreshTokenExpiresAt);

    return AuthResponseDto.fromAccessToken(accessToken);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @RefreshToken() refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.logoutService.execute(refreshToken);
    this.clearRefreshTokenCookie(res);
  }
}
