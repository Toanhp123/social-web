import { BaseException } from '@/core/exceptions/base.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

export class StorageError extends BaseException {
  constructor(
    message = 'Storage error',
    metadata?: unknown,
    code: ErrorCode = ErrorCode.STORAGE_ERROR,
    statusCode = 500,
    cause?: unknown,
  ) {
    super(code, message, statusCode, metadata, { cause });
  }
}
