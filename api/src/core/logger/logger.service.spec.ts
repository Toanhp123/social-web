import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { LoggerService } from '@/core/logger/logger.service.js';

describe('LoggerService', () => {
  const originalNoColor = process.env.NO_COLOR;
  let stdout: string[];

  beforeEach(() => {
    delete process.env.NO_COLOR;
    stdout = [];
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk: unknown) => {
      stdout.push(String(chunk));
      return true;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalNoColor === undefined) {
      delete process.env.NO_COLOR;
      return;
    }

    process.env.NO_COLOR = originalNoColor;
  });

  it('writes readable multiline colored logs in pretty mode', () => {
    const logger = createLogger('pretty');

    logger.warn('Request rejected', {
      requestId: 'request-1',
      method: 'POST',
      path: '/auth/login',
      statusCode: 401,
      exception: {
        name: 'DomainError',
        code: ErrorCode.INVALID_CREDENTIALS,
        message: 'Email or password is incorrect',
      },
    });

    const output = getOutput();

    expect(output).toContain('\n');
    expect(output).toContain('\x1b[');
    expect(output).toContain('WARN');
    expect(output).toContain('POST');
    expect(output).toContain('/auth/login');
    expect(output).toContain('401');
    expect(output).toContain('DomainError');
    expect(output).toContain(ErrorCode.INVALID_CREDENTIALS);
    expect(output).toContain('Email or password is incorrect');
    expect(output).toContain('request-1');
    expect(output).toContain('\x1b[1m\x1b[36mrequest-1');
  });

  it('keeps production logs as single-line json', () => {
    const logger = createLogger('json');

    logger.log('HTTP request completed', {
      requestId: 'request-1',
      method: 'POST',
      path: '/auth/login',
      statusCode: 401,
      durationMs: 3314.16,
    });

    const output = getOutput().trim();
    const entry = JSON.parse(output) as Record<string, unknown>;

    expect(output).not.toContain('\n');
    expect(entry).toEqual(
      expect.objectContaining({
        level: 'info',
        requestId: 'request-1',
        message: 'HTTP request completed',
        method: 'POST',
        path: '/auth/login',
        statusCode: 401,
        durationMs: 3314.16,
      }),
    );
  });

  function getOutput(): string {
    return stdout.join('');
  }
});

function createLogger(format: 'json' | 'pretty'): LoggerService {
  return new LoggerService({
    get: jest.fn((key: string) => {
      if (key === 'app.logFormat') {
        return format;
      }

      if (key === 'app.logLevel') {
        return 'debug';
      }

      return undefined;
    }),
  } as unknown as ConfigService);
}
