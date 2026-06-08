import { z } from "zod";

const MAX_COMMENT_CONTENT_LENGTH = 2000;

const optionalNullableString = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;

    return value.trim() || null;
  },
  z.string().min(1).nullable(),
);

const pageLimit = z.preprocess(
  (value) => (value === undefined ? undefined : value),
  z.number().int().min(1).max(50).optional(),
);

export const listPostCommentsSchema = z.object({
  postId: z.string().trim().min(1, "Post khong hop le."),
  parentId: optionalNullableString.optional(),
  cursor: optionalNullableString.optional(),
  limit: pageLimit,
});

export const createPostCommentSchema = z.object({
  postId: z.string().trim().min(1, "Post khong hop le."),
  parentId: z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() || undefined : value),
      z.string().min(1).optional(),
    ),
  content: z
    .string()
    .trim()
    .min(1, "Vui long nhap binh luan.")
    .max(MAX_COMMENT_CONTENT_LENGTH, "Binh luan qua dai."),
});

export type ListPostCommentsInput = z.infer<typeof listPostCommentsSchema>;
export type CreatePostCommentInput = z.infer<typeof createPostCommentSchema>;
