import { LogLevel, PinoLevel } from '@/core/logger/logger.types.js';

const PINO_LEVELS: Record<LogLevel, PinoLevel> = {
  log: 'info',
  error: 'error',
  warn: 'warn',
  debug: 'debug',
  verbose: 'trace',
  fatal: 'fatal',
};

export function toPinoLevel(level: LogLevel): PinoLevel {
  return PINO_LEVELS[level];
}
