import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { getRequestId } from '@/core/context/request-context.service.js';
import { redactValue } from '@/core/logger/redaction.util.js';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';
type LogMetadata = Record<string, unknown>;

@Injectable()
export class LoggerService implements NestLoggerService {
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
    const entry = {
      level,
      timestamp: new Date().toISOString(),
      requestId: getRequestId(),
      message: this.formatMessage(message),
      ...(metadata ? { metadata: redactValue(metadata) } : {}),
    };

    const line = this.safeStringify(entry);

    if (level === 'error' || level === 'fatal' || level === 'warn') {
      console.error(line);
      return;
    }

    console.log(line);
  }

  private formatMessage(message: unknown): string {
    if (message instanceof Error) {
      return message.message;
    }

    return typeof message === 'string'
      ? message
      : this.safeStringify(redactValue(message));
  }

  private safeStringify(value: unknown): string {
    const seen = new WeakSet<object>();

    return (
      JSON.stringify(value, (_key, item: unknown) => {
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
      }) ?? String(value)
    );
  }
}
