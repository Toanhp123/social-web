export const commentPostQueryKeys = {
  all: ["comment-post"] as const,
  postComments: (postId: string) =>
    [...commentPostQueryKeys.all, postId, "comments"] as const,
  comments: (postId: string, parentId?: string | null) =>
    [...commentPostQueryKeys.postComments(postId), parentId ?? "root"] as const,
};
