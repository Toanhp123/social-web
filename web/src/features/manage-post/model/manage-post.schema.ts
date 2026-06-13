import { z } from "zod";

export const removePostSchema = z.object({
  postId: z.string().min(1),
});

export const reportPostSchema = z.object({
  postId: z.string().min(1),
  reason: z.string().trim().max(500).optional(),
});

export type RemovePostInput = z.infer<typeof removePostSchema>;
export type ReportPostInput = z.infer<typeof reportPostSchema>;
