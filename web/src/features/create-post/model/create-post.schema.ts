import { z } from "zod";
import type { PostVisibility } from "@/entities/post";

const MAX_POST_CONTENT_LENGTH = 5000;
const MAX_POST_MEDIA_FILES = 10;
const POST_VISIBILITY_VALUES = [
  "PUBLIC",
  "FRIENDS_ONLY",
  "PRIVATE",
] as const satisfies readonly PostVisibility[];

export const createPostSchema = z
  .object({
    content: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().max(MAX_POST_CONTENT_LENGTH, "Noi dung bai viet qua dai."),
    ),
    visibility: z
      .enum(POST_VISIBILITY_VALUES)
      .catch("PUBLIC" satisfies PostVisibility),
    groupId: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() || null : null),
      z.string().min(1).nullable(),
    ),
    media: z.preprocess(
      (value) => (Array.isArray(value) ? value.filter(isNonEmptyFile) : []),
      z
        .array(z.custom<File>(isNonEmptyFile, "Tep media khong hop le."))
        .max(MAX_POST_MEDIA_FILES, "Qua nhieu tep media."),
    ),
  })
  .refine((input) => input.content.length > 0 || input.media.length > 0, {
    message: "Can nhap noi dung hoac chon anh/video.",
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;

function isNonEmptyFile(value: unknown): value is File {
  return value instanceof File && value.size > 0;
}
