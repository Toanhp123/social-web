import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { extractMessage } from '../../../common/utils/extract-message.util.js';
import { AUTH_ERROR } from '../constants/auth-error.constant.js';
import { AuthenticatedUser } from '../types/authenticated-user.type.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: unknown,
    info: unknown,
  ): TUser {
    if (err) {
      throw new UnauthorizedException({
        code: AUTH_ERROR.TOKEN_INVALID,
        message: err instanceof Error ? err.message : 'Invalid token',
      });
    }

    if (info) {
      throw new UnauthorizedException({
        code: AUTH_ERROR.TOKEN_ERROR,
        message: extractMessage(info) ?? 'Invalid token',
      });
    }

    if (!user) {
      throw new UnauthorizedException({
        code: AUTH_ERROR.USER_NOT_FOUND,
      });
    }

    return user as TUser;
  }
}
