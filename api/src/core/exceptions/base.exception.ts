import { ErrorCode } from './error-codes.js';

export abstract class BaseException<T = unknown> extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly metadata?: T,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
