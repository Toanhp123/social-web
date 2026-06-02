import {
  Injectable,
  LoggerService as NestLoggerService,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';
import pretty from 'pino-pretty';
import { getRequestId } from '@/core/context/request-context.service.js';
import { redactValue } from '@/core/logger/redaction.util.js';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';
type PinoLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type LogFormat = 'json' | 'pretty';
type LogMetadata = Record<string, unknown>;
type PrettyColors = {
  bold(value: string): string;
  cyan(value: string): string;
  gray(value: string): string;
  green(value: string): string;
  red(value: string): string;
  yellow(value: string): string;
};

const REDACT_PATHS = [
  'authorization',
  'cookie',
  'credentials',
  'jwt',
  'password',
  'passwordHash',
  'privateKey',
  'refreshToken',
  'secret',
  'session',
  'sessionId',
  'setCookie',
  'token',
  'accessToken',
  'headers.authorization',
  'headers.cookie',
  'req.headers.authorization',
  'req.headers.cookie',
  'metadata.authorization',
  'metadata.cookie',
  'metadata.password',
  'metadata.refreshToken',
  'metadata.token',
];

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: PinoLogger;

  constructor(@Optional() private readonly configService?: ConfigService) {
    this.logger = this.createLogger();
  }

  log(message: unknown, contextOrMeta?: string | LogMetadata): void {
    this.write('log', message, this.normalizeMetadata(contextOrMeta));
  }

  error(
    message: unknown,
    traceOrMeta?: string | LogMetadata,
    context?: string,
  ): void {
    this.write(
      'error',
      message,
      this.normalizeErrorMetadata(traceOrMeta, context),
    );
  }

  warn(message: unknown, contextOrMeta?: string | LogMetadata): void {
    this.write('warn', message, this.normalizeMetadata(contextOrMeta));
  }

  debug(message: unknown, contextOrMeta?: string | LogMetadata): void {
    this.write('debug', message, this.normalizeMetadata(contextOrMeta));
  }

  verbose(message: unknown, contextOrMeta?: string | LogMetadata): void {
    this.write('verbose', message, this.normalizeMetadata(contextOrMeta));
  }

  fatal(
    message: unknown,
    traceOrMeta?: string | LogMetadata,
    context?: string,
  ): void {
    this.write(
      'fatal',
      message,
      this.normalizeErrorMetadata(traceOrMeta, context),
    );
  }

  private createLogger(): PinoLogger {
    const options: LoggerOptions = {
      base: undefined,
      level: this.getLogLevel(),
      messageKey: 'message',
      redact: {
        paths: REDACT_PATHS,
        censor: '[REDACTED]',
      },
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      formatters: {
        level: (label) => ({ level: label }),
      },
    };

    if (this.getLogFormat() !== 'pretty') {
      return pino(options);
    }

    return pino(options, this.createPrettyStream());
  }

  private createPrettyStream() {
    return pretty({
      colorize: process.env.NO_COLOR === undefined,
      colorizeObjects: true,
      destination: process.stdout,
      errorLikeObjectKeys: ['err', 'error', 'exception'],
      ignore: 'pid,hostname,method,path,statusCode,durationMs',
      messageKey: 'message',
      sync: true,
      translateTime: 'SYS:HH:MM:ss.l',
      customPrettifiers: {
        exception: (value, _key, _log, { colors }) =>
          this.formatPrettyException(value, colors),
        requestId: (value, _key, _log, { colors }) => {
          const requestId =
            typeof value === 'string' ? value : this.safeStringify(value);

          return colors.bold(colors.cyan(requestId));
        },
      },
      messageFormat: (log, messageKey, _levelLabel, { colors }) => {
        const message = this.toText(log[messageKey]) ?? '';
        const http = this.formatPrettyHttp(log, colors);

        if (!http) {
          return colors.bold(message);
        }

        return `${colors.bold(message)}\n    ${colors.gray('http')}      ${http}`;
      },
    });
  }

  private normalizeMetadata(
    contextOrMeta?: string | LogMetadata,
  ): LogMetadata | undefined {
    if (!contextOrMeta) {
      return undefined;
    }

    return typeof contextOrMeta === 'string'
      ? { context: contextOrMeta }
      : contextOrMeta;
  }

  private normalizeErrorMetadata(
    traceOrMeta?: string | LogMetadata,
    context?: string,
  ): LogMetadata | undefined {
    if (!traceOrMeta && !context) {
      return undefined;
    }

    if (typeof traceOrMeta === 'string') {
      return {
        trace: traceOrMeta,
        ...(context ? { context } : {}),
      };
    }

    return {
      ...traceOrMeta,
      ...(context ? { context } : {}),
    };
  }

  private write(
    level: LogLevel,
    message: unknown,
    metadata?: LogMetadata,
  ): void {
    const payload = this.createPayload(metadata);
    const messageText = this.formatMessage(message);
    const method = this.toPinoLevel(level);

    if (Object.keys(payload).length === 0) {
      this.logger[method](messageText);
      return;
    }

    this.logger[method](payload, messageText);
  }

  private createPayload(metadata?: LogMetadata): LogMetadata {
    const safeMetadata = metadata
      ? (redactValue(metadata) as LogMetadata)
      : undefined;
    const payload: LogMetadata = {
      ...(safeMetadata ?? {}),
    };
    const requestId =
      getRequestId() ??
      (typeof safeMetadata?.requestId === 'string'
        ? safeMetadata.requestId
        : undefined);

    if (requestId) {
      payload.requestId = requestId;
    }

    return payload;
  }

  private formatMessage(message: unknown): string {
    if (message instanceof Error) {
      return message.message;
    }

    return typeof message === 'string'
      ? message
      : this.safeStringify(redactValue(message));
  }

  private getLogFormat(): LogFormat {
    return (
      this.configService?.get<LogFormat>('app.logFormat') ??
      (process.env.NODE_ENV === 'production' ? 'json' : 'pretty')
    );
  }

  private getLogLevel(): PinoLevel {
    return (
      this.configService?.get<PinoLevel>('app.logLevel') ??
      (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
    );
  }

  private toPinoLevel(level: LogLevel): PinoLevel {
    const levels: Record<LogLevel, PinoLevel> = {
      log: 'info',
      error: 'error',
      warn: 'warn',
      debug: 'debug',
      verbose: 'trace',
      fatal: 'fatal',
    };

    return levels[level];
  }

  private formatPrettyHttp(
    log: Record<string, unknown>,
    colors: PrettyColors,
  ): string | undefined {
    const method = this.toText(log.method);
    const path = this.toText(log.path);
    const statusCode =
      typeof log.statusCode === 'number' ? log.statusCode : undefined;
    const durationMs =
      typeof log.durationMs === 'number' ? log.durationMs : undefined;

    if (!method && !path && !statusCode && durationMs === undefined) {
      return undefined;
    }

    return [
      method ? colors.cyan(method.padEnd(6)) : undefined,
      path ? colors.bold(path) : undefined,
      statusCode ? this.formatPrettyStatusCode(statusCode, colors) : undefined,
      durationMs !== undefined
        ? this.formatPrettyDuration(durationMs, colors)
        : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private formatPrettyStatusCode(
    statusCode: number,
    colors: PrettyColors,
  ): string {
    const text = String(statusCode);

    if (statusCode >= 500) {
      return colors.red(text);
    }

    if (statusCode >= 400) {
      return colors.yellow(text);
    }

    if (statusCode >= 300) {
      return colors.cyan(text);
    }

    return colors.green(text);
  }

  private formatPrettyDuration(
    durationMs: number,
    colors: PrettyColors,
  ): string {
    const text = `${durationMs.toFixed(durationMs >= 100 ? 0 : 2)}ms`;

    if (durationMs >= 1000) {
      return colors.yellow(text);
    }

    return colors.gray(text);
  }

  private formatPrettyException(value: unknown, colors: PrettyColors): string {
    if (!this.isRecord(value)) {
      return String(value);
    }

    const name = this.toText(value.name);
    const code = this.toText(value.code);
    const message = this.toText(value.message);
    const stack = this.toText(value.stack);
    const details = value.metadata;
    const header = [name, code ? colors.yellow(code) : undefined]
      .filter(Boolean)
      .join(' ');
    const lines: string[] = [];

    if (header) {
      lines.push(header);
    }

    if (message) {
      lines.push(`${colors.gray('message')}   ${message}`);
    }

    if (details !== undefined) {
      lines.push(
        `${colors.gray('details')}   ${this.indentMultiline(this.safeStringify(details, 2), 14)}`,
      );
    }

    if (stack) {
      lines.push(
        `${colors.gray('stack')}     ${this.indentMultiline(stack, 12)}`,
      );
    }

    return lines.join('\n    ');
  }

  private indentMultiline(value: string, spaces: number): string {
    const indent = ' '.repeat(spaces);

    return value
      .split('\n')
      .map((line, index) => (index === 0 ? line : `${indent}${line}`))
      .join('\n');
  }

  private toText(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  private safeStringify(value: unknown, space?: number): string {
    const seen = new WeakSet<object>();

    return (
      JSON.stringify(
        value,
        (_key, item: unknown) => {
          if (typeof item === 'bigint') {
            return item.toString();
          }

          if (item && typeof item === 'object') {
            if (seen.has(item)) {
              return '[Circular]';
            }
            seen.add(item);
          }

          return item;
        },
        space,
      ) ?? String(value)
    );
  }
}
