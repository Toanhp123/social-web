import { describe, expect, it } from '@jest/globals';
import { createBullMqRedisConnection } from '@/infrastructure/queue/bullmq-connection.factory.js';

describe('createBullMqRedisConnection', () => {
  it('parses a redis URL into BullMQ connection options', () => {
    const connection = createBullMqRedisConnection(
      'redis://user:secret@localhost:6380/2',
    );

    expect(connection).toMatchObject({
      host: 'localhost',
      port: 6380,
      username: 'user',
      password: 'secret',
      db: 2,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
    });
  });

  it('enables TLS for rediss URLs', () => {
    const connection = createBullMqRedisConnection(
      'rediss://:secret@redis.example.com',
    );

    expect(connection).toMatchObject({
      host: 'redis.example.com',
      port: 6379,
      password: 'secret',
      tls: {},
    });
  });

  it('rejects unsupported Redis protocols', () => {
    expect(() => createBullMqRedisConnection('http://localhost:6379')).toThrow(
      'Unsupported BullMQ Redis protocol',
    );
  });
});
