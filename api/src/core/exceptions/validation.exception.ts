import { BaseException } from '@/core/exceptions/base.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

export class ValidationError extends BaseException {
  constructor(errors: any[]) {
    super(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400, errors);
  }
}
