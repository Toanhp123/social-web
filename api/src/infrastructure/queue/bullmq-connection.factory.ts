import type { ConnectionOptions } from 'bullmq';

export function createBullMqRedisConnection(
  redisUrl: string,
): ConnectionOptions {
  const url = new URL(redisUrl);

  if (!['redis:', 'rediss:'].includes(url.protocol)) {
    throw new Error(`Unsupported BullMQ Redis protocol: ${url.protocol}`);
  }

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: parseRedisDb(url.pathname),
    tls: url.protocol === 'rediss:' ? {} : undefined,
    connectTimeout: 5_000,
    enableOfflineQueue: false,
    maxRetriesPerRequest: null,
    retryStrategy: (attempt) => Math.min(attempt * 200, 2_000),
  };
}

function parseRedisDb(pathname: string): number {
  const rawDb = pathname.replace('/', '').trim();

  if (!rawDb) {
    return 0;
  }

  const db = Number(rawDb);

  if (!Number.isInteger(db) || db < 0) {
    throw new Error(`Invalid BullMQ Redis database: ${rawDb}`);
  }

  return db;
}
