import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../domain/object-values/jwt-payload.js';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwt: NestJwtService,
    private readonly config: ConfigService,
  ) {}

  // ==================== PRIVATE ====================

  private getOrThrow(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new InternalServerErrorException(`Missing config: ${key}`);
    }
    return value;
  }

  private signToken(
    payload: JwtPayload,
    secretKey: string,
    expiresKey: string,
  ): string {
    return this.jwt.sign(payload.toPlainObject(), {
      secret: this.getOrThrow(secretKey),
      expiresIn: this.config.get(expiresKey),
    });
  }

  private verifyToken(token: string, secretKey: string): JwtPayload {
    const decoded = this.jwt.verify<JwtPayload>(token, {
      secret: this.getOrThrow(secretKey),
    });

    return new JwtPayload(decoded.id, decoded.email, decoded.role);
  }

  // ==================== ACCESS ====================

  generateAccessToken(payload: JwtPayload): string {
    return this.signToken(payload, 'jwt.accessSecret', 'jwt.accessExpiresIn');
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.verifyToken(token, 'jwt.accessSecret');
  }

  // ==================== REFRESH ====================

  generateRefreshToken(payload: JwtPayload): string {
    return this.signToken(payload, 'jwt.refreshSecret', 'jwt.refreshExpiresIn');
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.verifyToken(token, 'jwt.refreshSecret');
  }
}
