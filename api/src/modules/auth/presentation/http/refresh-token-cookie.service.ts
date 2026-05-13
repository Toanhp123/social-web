import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Injectable()
export class RefreshTokenCookieService {
  constructor(private readonly configService: ConfigService) {}

  set(res: Response, refreshToken: string, expiresAt: Date): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'strict',
      path: '/auth',
      expires: expiresAt,
    });
  }

  clear(res: Response): void {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'strict',
      path: '/auth',
    });
  }

  private isProduction(): boolean {
    return this.configService.get<string>('app.env') === 'production';
  }
}
