const env = process.env.NODE_ENV || 'development';

type TrustProxyConfig = boolean | number | string;

export default () => ({
  app: {
    port: Number(process.env.PORT) || 3001,
    env,
    trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
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

function parseTrustProxy(value: string | undefined): TrustProxyConfig {
  const normalized = value?.trim();
  const lowerValue = normalized?.toLowerCase();

  if (!normalized || lowerValue === 'false' || normalized === '0') {
    return false;
  }

  if (lowerValue === 'true') {
    return true;
  }

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  return normalized;
}
