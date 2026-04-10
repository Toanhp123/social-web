// core/interceptors/request-context.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { requestContext } from '../context/request-context.service.js';
import { Request, Response } from 'express';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const requestId = randomUUID();

    return requestContext.run({ requestId }, () => {
      const req = context.switchToHttp().getRequest<Request>();
      req.requestId = requestId;

      const res = context.switchToHttp().getResponse<Response>();
      res.setHeader('x-request-id', requestId);

      return next.handle();
    });
  }
}
