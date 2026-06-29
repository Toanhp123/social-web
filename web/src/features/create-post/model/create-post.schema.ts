import { z } from "zod";
import type { PostVisibility } from "@/entities/post";

const MAX_POST_CONTENT_LENGTH = 5000;
const MAX_POST_MEDIA_FILES = 10;
const MAX_POST_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_POST_VIDEO_BYTES = 100 * 1024 * 1024;
const POST_VISIBILITY_VALUES = [
  "PUBLIC",
  "FRIENDS_ONLY",
  "PRIVATE",
] as const satisfies readonly PostVisibility[];
const POST_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const POST_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

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
  })
  .superRefine((input, context) => {
    input.media.forEach((file, index) => {
      const fileKind = getPostMediaKind(file);

      if (!fileKind) {
        context.addIssue({
          code: "custom",
          path: ["media", index],
          message: "Chi ho tro anh JPEG, PNG, WEBP hoac video MP4, WEBM, MOV.",
        });

        return;
      }

      const maxBytes =
        fileKind === "image" ? MAX_POST_IMAGE_BYTES : MAX_POST_VIDEO_BYTES;

      if (file.size > maxBytes) {
        context.addIssue({
          code: "custom",
          path: ["media", index],
          message:
            fileKind === "image"
              ? "Anh tai len toi da 10MB."
              : "Video tai len toi da 100MB.",
        });
      }
    });
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;

function isNonEmptyFile(value: unknown): value is File {
  return value instanceof File && value.size > 0;
}

function getPostMediaKind(file: File): "image" | "video" | null {
  if (POST_IMAGE_MIME_TYPES.has(file.type)) {
    return "image";
  }

  if (POST_VIDEO_MIME_TYPES.has(file.type)) {
    return "video";
  }

  return null;
}
