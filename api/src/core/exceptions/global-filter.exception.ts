// core/exceptions/global-filter.exception.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from './domain.exception.js';
import { DatabaseError } from './database.exception.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    console.log('🔥 Exception caught:', exception);

    // ========================
    // 1. DOMAIN ERROR
    // ========================
    if (exception instanceof DomainError) {
      return res.status(exception.statusCode).json({
        code: exception.code,
        message: exception.message,
        metadata: exception.metadata,
      });
    }

    // ========================
    // 2. DATABASE ERROR
    // ========================
    if (exception instanceof DatabaseError) {
      return res.status(500).json({
        code: exception.code,
        message: exception.message,
      });
    }

    // ========================
    // 3. VALIDATION ERROR (NestJS)
    // ========================
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: response,
      });
    }

    // ========================
    // 4. HTTP ERROR (fallback NestJS)
    // ========================
    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json({
        code: 'HTTP_ERROR',
        message: exception.message,
      });
    }

    // ========================
    // 5. UNKNOWN ERROR
    // ========================
    return res.status(500).json({
      code: 'UNKNOWN_ERROR',
      message: 'Unexpected error',
    });
  }
}
