import {
  Injectable,
  LoggerService as NestLoggerService,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger as PinoLogger } from 'pino';
import { getRequestId } from '@/core/context/request-context.service.js';
import { createPinoLogger } from '@/core/logger/pino-logger.factory.js';
import { toPinoLevel } from '@/core/logger/log-level.mapper.js';
import { redactValue } from '@/core/logger/redaction.util.js';
import { safeStringify } from '@/core/logger/safe-stringify.util.js';
import {
  LogFormat,
  LogLevel,
  LogMetadata,
  PinoLevel,
} from '@/core/logger/logger.types.js';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: PinoLogger;

  constructor(@Optional() private readonly configService?: ConfigService) {
    this.logger = createPinoLogger({
      format: this.getLogFormat(),
      level: this.getLogLevel(),
    });
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
    const method = toPinoLevel(level);

    if (!this.logger.isLevelEnabled(method)) {
      return;
    }

    const payload = this.createPayload(metadata);
    const messageText = this.formatMessage(message);

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
    const requestId =
      getRequestId() ??
      (typeof safeMetadata?.requestId === 'string'
        ? safeMetadata.requestId
        : undefined);

    return {
      ...(safeMetadata ?? {}),
      ...(requestId ? { requestId } : {}),
    };
  }

  private formatMessage(message: unknown): string {
    if (message instanceof Error) {
      return message.message;
    }

    return typeof message === 'string'
      ? message
      : safeStringify(redactValue(message));
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
}
