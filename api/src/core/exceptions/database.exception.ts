import { BaseException } from './base.exception.js';
import { ErrorCode } from './error-codes.js';

export class DatabaseError extends BaseException {
  constructor(
    message = 'Database error',
    metadata?: unknown,
    code: ErrorCode = ErrorCode.DATABASE_ERROR,
    statusCode = 500,
    cause?: unknown,
  ) {
    super(code, message, statusCode, metadata, { cause });
  }
}
