// core/filters/global-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions/base.exception.js';
import { ErrorCode } from '../exceptions/error-codes.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<Request>();

    const requestId = req.requestId;

    // =========================
    // 1. CUSTOM DOMAIN/DB ERROR
    // =========================
    if (exception instanceof BaseException) {
      return res.status(exception.statusCode).json({
        requestId,
        code: exception.code,
        message: exception.message,
        metadata: exception.metadata,
      });
    }

    // =========================
    // 2. VALIDATION ERROR
    // =========================
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      return res.status(400).json({
        requestId,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        errors: response,
      });
    }

    // =========================
    // 3. HTTP ERROR
    // =========================
    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json({
        requestId,
        code: 'HTTP_ERROR',
        message: exception.message,
      });
    }

    // =========================
    // 4. UNKNOWN ERROR
    // =========================
    console.error('🔥 Unhandled error:', exception);

    return res.status(500).json({
      requestId,
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'Unexpected error',
    });
  }
}
