import Joi from 'joi';

export const validationSchema = Joi.object({
  // App Validate
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database Validate
  DATABASE_URL: Joi.string().required(),

  // JWT Validate
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15p'),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
});
