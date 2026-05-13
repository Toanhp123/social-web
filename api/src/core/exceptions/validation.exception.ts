import { BaseException } from './base.exception.js';
import { ErrorCode } from './error-codes.js';

export class ValidationError extends BaseException {
  constructor(errors: any[]) {
    super(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400, errors);
  }
}
