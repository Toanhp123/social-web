import Joi from 'joi';

export const validationSchema = Joi.object({
  // App Validate
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  CORS_ORIGIN: Joi.string().allow('').optional(),
  LOG_FORMAT: Joi.string().valid('json', 'pretty').optional(),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .optional(),

  // Database Validate
  DATABASE_URL: Joi.string().required(),
  PRISMA_QUERY_LOG: Joi.boolean().default(false),
  REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),

  // JWT Validate
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
});
