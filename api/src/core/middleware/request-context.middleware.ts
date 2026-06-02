import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { requestContext } from '@/core/context/request-context.service.js';
import { LoggerService } from '@/core/logger/logger.service.js';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = this.resolveRequestId(req.headers['x-request-id']);
    const startedAt = process.hrtime.bigint();

    requestContext.run({ requestId }, () => {
      req.requestId = requestId;
      res.setHeader('x-request-id', requestId);

      res.on('finish', () => {
        const durationMs =
          Number(process.hrtime.bigint() - startedAt) / 1_000_000;

        const metadata = {
          requestId,
          method: req.method,
          path: req.originalUrl ?? req.url,
          statusCode: res.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
        };

        if (res.statusCode >= 500) {
          this.logger.error('HTTP request completed', metadata);
          return;
        }

        if (res.statusCode >= 400) {
          this.logger.warn('HTTP request completed', metadata);
          return;
        }

        this.logger.log('HTTP request completed', metadata);
      });

      next();
    });
  }

  private resolveRequestId(header: string | string[] | undefined): string {
    const value = Array.isArray(header) ? header[0] : header;

    if (value && /^[a-zA-Z0-9._:-]{8,128}$/.test(value)) {
      return value;
    }

    return randomUUID();
  }
}
