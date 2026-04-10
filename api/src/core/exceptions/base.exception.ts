// core/exceptions/base.exception.ts
export abstract class BaseException<T = unknown> extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly metadata?: T,
  ) {
    super(message);
  }
}
