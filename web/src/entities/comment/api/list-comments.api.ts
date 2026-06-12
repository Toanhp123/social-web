import { optionalAuthApiFetch } from "@/entities/session/server";
import type { CommentPage } from "../model/types";

export type ListCommentsApiInput = {
  postId: string;
  parentId?: string | null;
  cursor?: string | null;
  limit?: number;
};

export async function listCommentsApi({
  postId,
  parentId,
  cursor,
  limit = 20,
}: ListCommentsApiInput): Promise<CommentPage> {
  const searchParams = new URLSearchParams({ limit: String(limit) });

  if (parentId) {
    searchParams.set("parentId", parentId);
  }

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return optionalAuthApiFetch<CommentPage>(
    `/posts/${postId}/comments?${searchParams.toString()}`,
  );
}
