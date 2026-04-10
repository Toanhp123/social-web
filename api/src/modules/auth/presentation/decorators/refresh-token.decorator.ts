import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const RefreshToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const cookies = req.cookies ?? {};

    return typeof cookies.refreshToken === 'string'
      ? cookies.refreshToken
      : undefined;
  },
);
