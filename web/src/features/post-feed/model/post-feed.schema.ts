import { z } from "zod";

const optionalNullableString = z.preprocess((value) => {
  if (typeof value !== "string") return null;

  return value.trim() || null;
}, z.string().min(1).nullable());

export const listPostFeedSchema = z.object({
  cursor: optionalNullableString.optional(),
  limit: z.number().int().min(1).max(30).optional(),
  authorId: optionalNullableString.optional(),
});

export type ListPostFeedInput = z.infer<typeof listPostFeedSchema>;
