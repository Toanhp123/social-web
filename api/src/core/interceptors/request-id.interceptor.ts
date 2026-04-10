import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<Request>();

    req.requestId = randomUUID();

    const res = context.switchToHttp().getResponse<Response>();
    res.setHeader('x-request-id', req.requestId);

    return next.handle();
  }
}
