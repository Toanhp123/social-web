// core/exceptions/error-codes.ts
export enum ErrorCode {
  // system
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // domain
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // database
  DATABASE_ERROR = 'DATABASE_ERROR',
}
