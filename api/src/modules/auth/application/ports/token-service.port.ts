import { JwtPayload } from '../../domain/value-objects/jwt-payload.js';

export interface TokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
  getRefreshTokenExpiresAt(now?: Date): Date;
}
