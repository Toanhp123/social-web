import { ArgumentsHost } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filter.js';
import { LoggerService } from '@/core/logger/logger.service.js';

describe('GlobalExceptionFilter', () => {
  let logger: {
    error: jest.Mock;
    warn: jest.Mock;
  };
  let response: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let host: ArgumentsHost;
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
      warn: jest.fn(),
    };

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    host = {
      switchToHttp: () => ({
        getRequest: () => ({
          requestId: 'request-1',
          method: 'POST',
          originalUrl: '/auth/login',
          url: '/auth/login',
        }),
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    filter = new GlobalExceptionFilter(logger as unknown as LoggerService);
  });

  it('logs client domain errors without a stack trace', () => {
    const exception = new DomainError(
      ErrorCode.INVALID_CREDENTIALS,
      'Email or password is incorrect',
      401,
    );

    filter.catch(exception, host);

    expect(logger.warn).toHaveBeenCalledWith(
      'Request rejected',
      expect.objectContaining({
        requestId: 'request-1',
        method: 'POST',
        path: '/auth/login',
        statusCode: 401,
        exception: expect.objectContaining({
          name: 'DomainError',
          code: ErrorCode.INVALID_CREDENTIALS,
          message: 'Email or password is incorrect',
        }),
      }),
    );
    expect(logger.warn.mock.calls[0][1].exception).not.toHaveProperty('stack');
    expect(logger.error).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(401);
  });

  it('logs server errors with a stack trace', () => {
    const exception = new DatabaseError('Database failed');

    filter.catch(exception, host);

    expect(logger.error).toHaveBeenCalledWith(
      'Request failed',
      expect.objectContaining({
        statusCode: 500,
        exception: expect.objectContaining({
          name: 'DatabaseError',
          message: 'Database failed',
          stack: expect.any(String),
        }),
      }),
    );
    expect(logger.warn).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(500);
  });
});
