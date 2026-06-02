const env = process.env.NODE_ENV || 'development';

export default () => ({
  app: {
    port: Number(process.env.PORT) || 3001,
    env,
    logFormat:
      process.env.LOG_FORMAT ?? (env === 'production' ? 'json' : 'pretty'),
    corsOrigins:
      process.env.CORS_ORIGIN?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) ?? [],
  },
});
