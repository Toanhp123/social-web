export default () => ({
  app: {
    port: Number(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || 'development',
    corsOrigins:
      process.env.CORS_ORIGIN?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) ?? [],
  },
});
