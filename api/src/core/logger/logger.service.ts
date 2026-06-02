import {
  Injectable,
  LoggerService as NestLoggerService,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRequestId } from '@/core/context/request-context.service.js';
import { redactValue } from '@/core/logger/redaction.util.js';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';
type LogFormat = 'json' | 'pretty';
type LogMetadata = Record<string, unknown>;
type LogEntry = {
  level: LogLevel;
  timestamp: string;
  requestId?: string;
  message: string;
  metadata?: LogMetadata;
};

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
} as const;

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(@Optional() private readonly configService?: ConfigService) {}

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
    const safeMetadata = metadata
      ? (redactValue(metadata) as LogMetadata)
      : undefined;
    const requestId =
      getRequestId() ??
      (typeof safeMetadata?.requestId === 'string'
        ? safeMetadata.requestId
        : undefined);
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      requestId,
      message: this.formatMessage(message),
      ...(safeMetadata ? { metadata: safeMetadata } : {}),
    };

    const line =
      this.getLogFormat() === 'pretty'
        ? this.formatPrettyEntry(entry)
        : this.safeStringify(entry);

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

  private getLogFormat(): LogFormat {
    return (
      this.configService?.get<LogFormat>('app.logFormat') ??
      (process.env.NODE_ENV === 'production' ? 'json' : 'pretty')
    );
  }

  private formatPrettyEntry(entry: LogEntry): string {
    const metadata = entry.metadata ?? {};
    const lines = [
      `${this.color(`[${this.formatTime(entry.timestamp)}]`, ANSI.gray)} ${this.formatLevel(entry.level)} ${this.color(entry.message, ANSI.bold)}`,
    ];
    const requestLine = this.formatRequestLine(metadata);
    const exceptionLines = this.formatExceptionLines(metadata.exception);
    const requestId = this.resolveEntryRequestId(entry, metadata);
    const remainingMetadata = this.omitMetadata(metadata, [
      'requestId',
      'method',
      'path',
      'statusCode',
      'durationMs',
      'exception',
    ]);

    if (requestLine) {
      lines.push(`  ${this.color('http', ANSI.dim)}      ${requestLine}`);
    }

    if (exceptionLines.length > 0) {
      lines.push(...exceptionLines);
    }

    if (requestId) {
      lines.push(
        `  ${this.color('requestId', ANSI.dim)} ${this.highlight(requestId)}`,
      );
    }

    lines.push(...this.formatMetadataLines(remainingMetadata));

    return lines.join('\n');
  }

  private formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  private formatLevel(level: LogLevel): string {
    const levelText: Record<LogLevel, string> = {
      log: 'INFO ',
      error: 'ERROR',
      warn: 'WARN ',
      debug: 'DEBUG',
      verbose: 'TRACE',
      fatal: 'FATAL',
    };
    const levelColor: Record<LogLevel, string> = {
      log: ANSI.green,
      error: ANSI.red,
      warn: ANSI.yellow,
      debug: ANSI.cyan,
      verbose: ANSI.magenta,
      fatal: ANSI.red,
    };

    return this.color(levelText[level], levelColor[level]);
  }

  private formatRequestLine(metadata: LogMetadata): string | undefined {
    const method = this.toText(metadata.method);
    const path = this.toText(metadata.path);
    const statusCode =
      typeof metadata.statusCode === 'number' ? metadata.statusCode : undefined;
    const durationMs =
      typeof metadata.durationMs === 'number' ? metadata.durationMs : undefined;

    if (!method && !path && !statusCode && durationMs === undefined) {
      return undefined;
    }

    return [
      method ? this.color(method.padEnd(6), ANSI.cyan) : undefined,
      path ? this.color(path, ANSI.bold) : undefined,
      statusCode ? this.formatStatusCode(statusCode) : undefined,
      durationMs !== undefined ? this.formatDuration(durationMs) : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private formatStatusCode(statusCode: number): string {
    const text = String(statusCode);

    if (statusCode >= 500) {
      return this.color(text, ANSI.red);
    }

    if (statusCode >= 400) {
      return this.color(text, ANSI.yellow);
    }

    if (statusCode >= 300) {
      return this.color(text, ANSI.cyan);
    }

    return this.color(text, ANSI.green);
  }

  private formatDuration(durationMs: number): string {
    const text = `${durationMs.toFixed(durationMs >= 100 ? 0 : 2)}ms`;

    if (durationMs >= 1000) {
      return this.color(text, ANSI.yellow);
    }

    return this.color(text, ANSI.gray);
  }

  private formatExceptionLines(exception: unknown): string[] {
    if (!this.isRecord(exception)) {
      return [];
    }

    const name = this.toText(exception.name);
    const code = this.toText(exception.code);
    const message = this.toText(exception.message);
    const stack = this.toText(exception.stack);
    const metadata = exception.metadata;
    const header = [name, code ? this.color(code, ANSI.yellow) : undefined]
      .filter(Boolean)
      .join(' ');
    const lines: string[] = [];

    if (header) {
      lines.push(`  ${this.color('error', ANSI.dim)}     ${header}`);
    }

    if (message) {
      lines.push(`  ${this.color('message', ANSI.dim)}   ${message}`);
    }

    if (metadata !== undefined) {
      lines.push(...this.formatMetadataField('details', metadata));
    }

    if (stack) {
      const [firstLine, ...remainingLines] = stack.split('\n');
      lines.push(`  ${this.color('stack', ANSI.dim)}     ${firstLine}`);
      lines.push(...remainingLines.map((line) => `            ${line}`));
    }

    return lines;
  }

  private formatMetadataLines(metadata: LogMetadata): string[] {
    return Object.entries(metadata).flatMap(([key, value]) =>
      this.formatMetadataField(key, value),
    );
  }

  private formatMetadataField(key: string, value: unknown): string[] {
    const label = this.color(key.padEnd(9), ANSI.dim);

    if (this.isPrimitive(value)) {
      return [`  ${label} ${String(value)}`];
    }

    const formatted = this.safeStringify(value, 2);
    const indented = formatted
      .split('\n')
      .map((line, index) => (index === 0 ? line : `            ${line}`))
      .join('\n');

    return [`  ${label} ${indented}`];
  }

  private omitMetadata(metadata: LogMetadata, keys: string[]): LogMetadata {
    const ignoredKeys = new Set(keys);

    return Object.fromEntries(
      Object.entries(metadata).filter(([key]) => !ignoredKeys.has(key)),
    );
  }

  private resolveEntryRequestId(
    entry: LogEntry,
    metadata: LogMetadata,
  ): string | undefined {
    return (
      entry.requestId ??
      (typeof metadata.requestId === 'string' ? metadata.requestId : undefined)
    );
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

  private isPrimitive(value: unknown): boolean {
    return (
      value === null ||
      ['bigint', 'boolean', 'number', 'string', 'undefined'].includes(
        typeof value,
      )
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  private color(value: string, color: string): string {
    if (process.env.NO_COLOR !== undefined) {
      return value;
    }

    return `${color}${value}${ANSI.reset}`;
  }

  private highlight(value: string): string {
    if (process.env.NO_COLOR !== undefined) {
      return value;
    }

    return `${ANSI.bold}${ANSI.cyan}${value}${ANSI.reset}`;
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
