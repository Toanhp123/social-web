import { z } from "zod";

const envSchema = z.object({
  API_URL: z.url(),
  API_PUBLIC_URL: z.url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  API_PUBLIC_URL: parsedEnv.API_PUBLIC_URL ?? parsedEnv.API_URL,
  IS_PRODUCTION: parsedEnv.NODE_ENV === "production",
  IS_DEVELOPMENT: parsedEnv.NODE_ENV === "development",
};
