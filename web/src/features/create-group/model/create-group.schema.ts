import { z } from "zod";
import type { GroupPrivacy } from "@/entities/group";

const GROUP_PRIVACY_VALUES = ["PUBLIC", "PRIVATE"] as const satisfies readonly GroupPrivacy[];

export const createGroupSchema = z.object({
  name: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "Can nhap ten nhom.").max(120, "Ten nhom qua dai."),
  ),
  description: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() || null : null),
    z.string().max(2000, "Mo ta qua dai.").nullable(),
  ),
  privacy: z.enum(GROUP_PRIVACY_VALUES).catch("PUBLIC" satisfies GroupPrivacy),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
