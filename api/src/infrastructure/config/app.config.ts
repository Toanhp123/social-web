const env = process.env.NODE_ENV || 'development';

export default () => ({
  app: {
    port: Number(process.env.PORT) || 3001,
    env,
    logFormat:
      process.env.LOG_FORMAT ?? (env === 'production' ? 'json' : 'pretty'),
    logLevel:
      process.env.LOG_LEVEL ?? (env === 'production' ? 'info' : 'debug'),
    corsOrigins:
      process.env.CORS_ORIGIN?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) ?? [],
  },
});
