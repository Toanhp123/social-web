import { z } from "zod";

const searchQuery = z.preprocess((value) => {
  if (typeof value !== "string") return "";

  return value.trim();
}, z.string().max(100));

export const searchPreviewSchema = z.object({
  query: searchQuery,
  userLimit: z.number().int().min(1).max(10).optional(),
  postLimit: z.number().int().min(1).max(10).optional(),
});

export const searchUsersSchema = z.object({
  query: searchQuery,
  limit: z.number().int().min(1).max(30).optional(),
});

export type SearchPreviewInput = z.infer<typeof searchPreviewSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
