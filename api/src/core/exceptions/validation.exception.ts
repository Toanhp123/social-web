// core/exceptions/validation.exception.ts
import { BaseException } from './base.exception.js';

export class ValidationError extends BaseException {
  constructor(errors: any[]) {
    super('VALIDATION_ERROR', 'Validation failed', 400, errors);
  }
}
