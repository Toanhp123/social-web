import { z } from "zod";
import type { ReactionType } from "@/entities/post";

const REACTION_TYPES = [
  "LIKE",
  "LOVE",
  "HAHA",
  "WOW",
  "SAD",
  "ANGRY",
] as const satisfies readonly ReactionType[];

export const setPostReactionSchema = z.object({
  postId: z.string().trim().min(1, "Post khong hop le."),
  type: z.enum(REACTION_TYPES),
});

export const removePostReactionSchema = z.object({
  postId: z.string().trim().min(1, "Post khong hop le."),
});

export type SetPostReactionInput = z.infer<typeof setPostReactionSchema>;
