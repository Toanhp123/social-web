import { BaseException } from '@/core/exceptions/base.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

export class DomainError extends BaseException {
  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 400,
    metadata?: unknown,
  ) {
    super(code, message, statusCode, metadata);
  }
}
