import { z } from "zod";

const envSchema = z.object({
  API_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  IS_PRODUCTION: parsedEnv.NODE_ENV === "production",
  IS_DEVELOPMENT: parsedEnv.NODE_ENV === "development",
};
