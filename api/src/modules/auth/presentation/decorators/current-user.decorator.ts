import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../../domain/types/jwt-user.type.js';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
