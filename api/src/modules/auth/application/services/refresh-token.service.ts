import { Injectable } from '@nestjs/common';
import { JwtService } from '../../infrastructure/services/jwt.service.js';
import { DomainError } from './../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly jwtService: JwtService) {}

  execute(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new DomainError(
        ErrorCode.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
        401,
        { refreshToken },
      );
    }

    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    const accessToken = this.jwtService.generateAccessToken(payload);

    return { accessToken };
  }
}
