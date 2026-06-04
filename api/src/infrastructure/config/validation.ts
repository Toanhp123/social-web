import Joi from 'joi';

export const validationSchema = Joi.object({
  // App Validate
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  TRUST_PROXY: Joi.alternatives()
    .try(Joi.boolean(), Joi.number(), Joi.string().allow(''))
    .default(false),
  CORS_ORIGIN: Joi.string().allow('').optional(),
  LOG_FORMAT: Joi.string().valid('json', 'pretty').optional(),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .optional(),
  WEB_APP_URL: Joi.string().uri().default('http://localhost:3000'),

  // Database Validate
  DATABASE_URL: Joi.string().required(),
  PRISMA_QUERY_LOG: Joi.boolean().default(false),
  REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),
  BULLMQ_PREFIX: Joi.string().default('social-web'),
  BULLMQ_JOB_ATTEMPTS: Joi.number().integer().min(1).default(3),
  BULLMQ_BACKOFF_DELAY_MS: Joi.number().integer().min(0).default(5000),
  BULLMQ_REMOVE_ON_COMPLETE: Joi.number().integer().min(0).default(1000),
  BULLMQ_REMOVE_ON_FAIL: Joi.number().integer().min(0).default(5000),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
  CLOUDINARY_UPLOAD_FOLDER: Joi.string().default('social-web'),
  CLOUDINARY_SECURE: Joi.boolean().default(true),

  // Email Validate
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  EMAIL_FROM: Joi.string().allow('').default('Social Web <no-reply@localhost>'),
  EMAIL_VERIFICATION_TOKEN_TTL_MINUTES: Joi.number()
    .integer()
    .min(1)
    .default(30),

  // JWT Validate
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // OAuth Validate
  OAUTH_STATE_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CALLBACK_URL: Joi.string()
    .uri()
    .default('http://localhost:3001/auth/google/callback'),
});
