import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser | null>(
    err: unknown,
    user: unknown,
  ): TUser {
    if (err || !user) {
      return null as TUser;
    }

    return user as TUser;
  }
}
