import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.js';
import { DomainError } from '../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { TokenService } from '../../application/ports/token-service.port.js';

@Injectable()
export class JwtService implements TokenService {
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

  private verifyToken(
    token: string,
    secretKey: string,
    errorCode: ErrorCode.INVALID_TOKEN | ErrorCode.INVALID_REFRESH_TOKEN,
  ): JwtPayload {
    const secret = this.getOrThrow(secretKey);

    try {
      const decoded = this.jwt.verify<JwtPayload>(token, {
        secret,
      });

      if (!decoded?.id || !decoded.email || !decoded.role) {
        throw new Error('Invalid token payload');
      }

      return new JwtPayload(decoded.id, decoded.email, decoded.role);
    } catch {
      throw new DomainError(errorCode, 'Invalid token', 401);
    }
  }

  // ==================== ACCESS ====================

  generateAccessToken(payload: JwtPayload): string {
    return this.signToken(payload, 'jwt.accessSecret', 'jwt.accessExpiresIn');
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.verifyToken(token, 'jwt.accessSecret', ErrorCode.INVALID_TOKEN);
  }

  // ==================== REFRESH ====================

  generateRefreshToken(payload: JwtPayload): string {
    return this.signToken(payload, 'jwt.refreshSecret', 'jwt.refreshExpiresIn');
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.verifyToken(
      token,
      'jwt.refreshSecret',
      ErrorCode.INVALID_REFRESH_TOKEN,
    );
  }

  getRefreshTokenExpiresAt(now = new Date()): Date {
    return new Date(
      now.getTime() +
        this.parseDuration(this.getOrThrow('jwt.refreshExpiresIn')),
    );
  }

  private parseDuration(value: string): number {
    const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());

    if (!match) {
      throw new InternalServerErrorException(
        `Invalid duration config: jwt.refreshExpiresIn`,
      );
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return amount * multipliers[unit];
  }
}
