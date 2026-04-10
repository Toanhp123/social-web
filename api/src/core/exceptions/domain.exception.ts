// core/exceptions/domain.exception.ts
import { BaseException } from './base.exception.js';

export class DomainError extends BaseException {
  constructor(code: string, message: string, statusCode = 400, metadata?: any) {
    super(code, message, statusCode, metadata);
  }
}
