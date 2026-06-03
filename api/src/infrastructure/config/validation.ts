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

  // JWT Validate
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
});
