import { z } from "zod";
import type { PostVisibility } from "@/entities/post";

const MAX_SHARE_CONTENT_LENGTH = 5000;
const POST_VISIBILITY_VALUES = [
  "PUBLIC",
  "FRIENDS_ONLY",
  "PRIVATE",
] as const satisfies readonly PostVisibility[];

export const sharePostSchema = z.object({
  postId: z.string().trim().min(1, "Post khong hop le."),
  content: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().max(MAX_SHARE_CONTENT_LENGTH, "Noi dung chia se qua dai."),
  ),
  visibility: z.enum(POST_VISIBILITY_VALUES).optional(),
});

export type SharePostInput = z.infer<typeof sharePostSchema>;
