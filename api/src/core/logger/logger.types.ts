export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';
export type PinoLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogFormat = 'json' | 'pretty';
export type LogMetadata = Record<string, unknown>;

export type PrettyColors = {
  bold(value: string): string;
  cyan(value: string): string;
  gray(value: string): string;
  green(value: string): string;
  red(value: string): string;
  yellow(value: string): string;
};
