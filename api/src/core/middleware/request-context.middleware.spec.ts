import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '@/core/logger/logger.service.js';
import { RequestContextMiddleware } from '@/core/middleware/request-context.middleware.js';

describe('RequestContextMiddleware', () => {
  let logger: {
    error: jest.Mock;
    log: jest.Mock;
    warn: jest.Mock;
  };
  let middleware: RequestContextMiddleware;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    };

    middleware = new RequestContextMiddleware(
      logger as unknown as LoggerService,
    );
  });

  it('logs completed client-error requests at info level', () => {
    let finishHandler: (() => void) | undefined;
    const request = {
      headers: {},
      method: 'POST',
      originalUrl: '/auth/login',
      url: '/auth/login',
    } as Request;
    const response = {
      statusCode: 401,
      setHeader: jest.fn(),
      on: jest.fn((event: string, handler: () => void) => {
        if (event === 'finish') {
          finishHandler = handler;
        }
      }),
    } as unknown as Response;
    const next: NextFunction = jest.fn();

    middleware.use(request, response, next);
    finishHandler?.();

    expect(logger.log).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.objectContaining({
        method: 'POST',
        path: '/auth/login',
        statusCode: 401,
      }),
    );
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
