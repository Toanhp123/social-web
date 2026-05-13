import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getRequestId } from '../context/request-context.service.js';
import { BaseException } from '../exceptions/base.exception.js';
import { ErrorCode } from '../exceptions/error-codes.js';
import { LoggerService } from '../logger/logger.service.js';
import { redactValue } from '../logger/redaction.util.js';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<Request>();
    const requestId = req.requestId ?? getRequestId();
    const statusCode = this.getStatusCode(exception);
    const requestMetadata = {
      requestId,
      method: req.method,
      path: req.originalUrl ?? req.url,
      statusCode,
    };

    if (exception instanceof BaseException) {
      this.logException(exception, requestMetadata);

      res.status(exception.statusCode).json({
        requestId,
        code: exception.code,
        message: exception.message,
        metadata: this.sanitizeMetadata(exception.metadata),
      });
      return;
    }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      const errors = this.sanitizeMetadata(response);
      this.logger.warn('Request validation failed', {
        ...requestMetadata,
        errors,
      });

      res.status(400).json({
        requestId,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const body =
        response && typeof response === 'object'
          ? (response as Record<string, unknown>)
          : undefined;

      this.logException(exception, requestMetadata);

      res.status(exception.getStatus()).json({
        requestId,
        code: body?.code ?? this.getDefaultHttpCode(exception.getStatus()),
        message: body?.message ?? exception.message,
      });
      return;
    }

    this.logger.error('Unhandled exception', {
      ...requestMetadata,
      exception: this.serializeException(exception),
    });

    res.status(500).json({
      requestId,
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'Unexpected error',
    });
  }

  private sanitizeMetadata(metadata: unknown): unknown {
    return redactValue(metadata);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof BaseException) {
      return exception.statusCode;
    }

    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return 500;
  }

  private getDefaultHttpCode(statusCode: number): ErrorCode {
    if (statusCode === 400) {
      return ErrorCode.VALIDATION_ERROR;
    }

    if (statusCode === 401) {
      return ErrorCode.UNAUTHORIZED;
    }

    if (statusCode === 403) {
      return ErrorCode.FORBIDDEN;
    }

    if (statusCode === 404) {
      return ErrorCode.RESOURCE_NOT_FOUND;
    }

    return ErrorCode.UNKNOWN_ERROR;
  }

  private logException(
    exception: BaseException | HttpException,
    metadata: Record<string, unknown>,
  ): void {
    const payload = {
      ...metadata,
      exception: this.serializeException(exception),
    };

    if (this.getStatusCode(exception) >= 500) {
      this.logger.error('Request failed', payload);
      return;
    }

    this.logger.warn('Request rejected', payload);
  }

  private serializeException(exception: unknown): unknown {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return exception;
  }
}
