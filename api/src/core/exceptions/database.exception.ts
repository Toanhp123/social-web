// core/exceptions/database.exception.ts
import { BaseException } from './base.exception.js';

export class DatabaseError extends BaseException {
  constructor(message = 'Database error', metadata?: any) {
    super('DATABASE_ERROR', message, 500, metadata);
  }
}
