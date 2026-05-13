const sensitiveKeys = new Set([
  'apikey',
  'authorization',
  'clientsecret',
  'cookie',
  'credentials',
  'jwt',
  'password',
  'privatekey',
  'refreshtoken',
  'secret',
  'session',
  'sessionid',
  'setcookie',
  'token',
]);

function normalizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function shouldRedactKey(key: string): boolean {
  const normalizedKey = normalizeKey(key);

  return (
    sensitiveKeys.has(normalizedKey) ||
    normalizedKey.includes('credential') ||
    normalizedKey.includes('password') ||
    normalizedKey.includes('secret') ||
    normalizedKey.includes('token') ||
    normalizedKey.endsWith('hash')
  );
}

export function redactValue(
  value: unknown,
  seen = new WeakSet<object>(),
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, seen));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (seen.has(value)) {
    return '[Circular]';
  }
  seen.add(value);

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      shouldRedactKey(key) ? '[REDACTED]' : redactValue(item, seen),
    ]),
  );
}
