import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from '../../domain/types/jwt-user.type.js';
import { AUTH_ERROR } from '../../domain/constants/auth-error.js';
import { extractMessage } from './../../../../common/utils/extract-message.util.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtUser>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
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
