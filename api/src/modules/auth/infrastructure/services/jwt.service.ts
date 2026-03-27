import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== ACCESS TOKEN ====================
  generateAccessToken(payload: { sub: string; email: string }): string {
    const secret = this.configService.get<string>('jwt.accessSecret');

    if (!secret) {
      throw new Error('JWT_ACCESS_TOKEN_SECRET is not defined in .env');
    }

    return this.nestJwtService.sign(payload, {
      secret: secret,
      expiresIn: this.configService.get('jwt.accessExpiresIn') || '15m',
    });
  }

  // ==================== REFRESH TOKEN ====================
  generateRefreshToken(payload: { sub: string; email: string }): string {
    const secret = this.configService.get<string>('jwt.refreshSecret');

    if (!secret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not defined in .env');
    }

    return this.nestJwtService.sign(payload, {
      secret: secret,
      expiresIn: this.configService.get('jwt.refreshExpiresIn') || '7d',
    });
  }

  // Verify Access Token
  verifyAccessToken(token: string): any {
    const secret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_TOKEN_SECRET is not defined');

    return this.nestJwtService.verify(token, { secret });
  }

  // Verify Refresh Token
  verifyRefreshToken(token: string): any {
    const secret = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET');
    if (!secret) throw new Error('JWT_REFRESH_TOKEN_SECRET is not defined');

    return this.nestJwtService.verify(token, { secret });
  }
}
