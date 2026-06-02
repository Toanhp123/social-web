import type { PrettyOptions } from 'pino-pretty';
import { PrettyColors } from '@/core/logger/logger.types.js';
import { safeStringify } from '@/core/logger/safe-stringify.util.js';

export function createPrettyLogOptions(): PrettyOptions {
  return {
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
        formatPrettyException(value, colors),
      requestId: (value, _key, _log, { colors }) => {
        const requestId =
          typeof value === 'string' ? value : safeStringify(value);

        return colors.bold(colors.cyan(requestId));
      },
    },
    messageFormat: (log, messageKey, _levelLabel, { colors }) => {
      const message = toText(log[messageKey]) ?? '';
      const http = formatPrettyHttp(log, colors);

      if (!http) {
        return colors.bold(message);
      }

      return `${colors.bold(message)}\n    ${colors.gray('http')}      ${http}`;
    },
  };
}

function formatPrettyHttp(
  log: Record<string, unknown>,
  colors: PrettyColors,
): string | undefined {
  const method = toText(log.method);
  const path = toText(log.path);
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
    statusCode ? formatPrettyStatusCode(statusCode, colors) : undefined,
    durationMs !== undefined
      ? formatPrettyDuration(durationMs, colors)
      : undefined,
  ]
    .filter(Boolean)
    .join(' ');
}

function formatPrettyStatusCode(
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

function formatPrettyDuration(
  durationMs: number,
  colors: PrettyColors,
): string {
  const text = `${durationMs.toFixed(durationMs >= 100 ? 0 : 2)}ms`;

  if (durationMs >= 1000) {
    return colors.yellow(text);
  }

  return colors.gray(text);
}

function formatPrettyException(value: unknown, colors: PrettyColors): string {
  if (!isRecord(value)) {
    return String(value);
  }

  const name = toText(value.name);
  const code = toText(value.code);
  const message = toText(value.message);
  const stack = toText(value.stack);
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
      `${colors.gray('details')}   ${indentMultiline(safeStringify(details, 2), 14)}`,
    );
  }

  if (stack) {
    lines.push(`${colors.gray('stack')}     ${indentMultiline(stack, 12)}`);
  }

  return lines.join('\n    ');
}

function indentMultiline(value: string, spaces: number): string {
  const indent = ' '.repeat(spaces);

  return value
    .split('\n')
    .map((line, index) => (index === 0 ? line : `${indent}${line}`))
    .join('\n');
}

function toText(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
