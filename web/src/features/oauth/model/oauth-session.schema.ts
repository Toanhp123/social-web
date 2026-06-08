import { z } from "zod";

export const oauthSessionSchema = z.object({
  code: z.string().trim().min(1, "OAuth code is required."),
  deviceId: z.string().trim().min(1, "Device id is required."),
});
