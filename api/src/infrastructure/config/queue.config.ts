function readNumberEnv(key: string, fallback: number): number {
  const rawValue = process.env[key]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  return Number.isFinite(value) ? value : fallback;
}

export default () => ({
  queue: {
    prefix: process.env.BULLMQ_PREFIX?.trim() || 'social-web',
    defaultJobOptions: {
      attempts: readNumberEnv('BULLMQ_JOB_ATTEMPTS', 3),
      backoffDelayMs: readNumberEnv('BULLMQ_BACKOFF_DELAY_MS', 5_000),
      removeOnComplete: readNumberEnv('BULLMQ_REMOVE_ON_COMPLETE', 1_000),
      removeOnFail: readNumberEnv('BULLMQ_REMOVE_ON_FAIL', 5_000),
    },
  },
});
