import { createRequire } from 'node:module';
import pino, {
  DestinationStream,
  Logger as PinoLogger,
  LoggerOptions,
} from 'pino';
import type { PrettyOptions } from 'pino-pretty';
import { LogFormat, PinoLevel } from '@/core/logger/logger.types.js';
import { createPrettyLogOptions } from '@/core/logger/pretty-log.formatter.js';
import { PINO_REDACT_PATHS } from '@/core/logger/redaction.util.js';

type LoggerFactoryConfig = {
  format: LogFormat;
  level: PinoLevel;
};

type PinoPrettyFactory = (options?: PrettyOptions) => DestinationStream;

const require = createRequire(import.meta.url);

export function createPinoLogger(config: LoggerFactoryConfig): PinoLogger {
  const options: LoggerOptions = {
    base: undefined,
    level: config.level,
    messageKey: 'message',
    redact: {
      paths: PINO_REDACT_PATHS,
      censor: '[REDACTED]',
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label }),
    },
  };

  if (config.format !== 'pretty') {
    return pino(options);
  }

  return pino(options, createPrettyStream());
}

function createPrettyStream(): DestinationStream {
  return loadPinoPretty()(createPrettyLogOptions());
}

function loadPinoPretty(): PinoPrettyFactory {
  try {
    return require('pino-pretty') as PinoPrettyFactory;
  } catch (error) {
    if (isModuleNotFoundError(error)) {
      throw new Error(
        'LOG_FORMAT=pretty requires pino-pretty. Install dev dependencies or switch LOG_FORMAT=json.',
        { cause: error },
      );
    }

    throw error;
  }
}

function isModuleNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'code' in error && error.code === 'MODULE_NOT_FOUND';
}
