export const postQueryKeys = {
  all: ["posts"] as const,
  feed: () => [...postQueryKeys.all, "feed"] as const,
  postComments: (postId: string) =>
    [...postQueryKeys.all, postId, "comments"] as const,
  comments: (postId: string, parentId?: string | null) =>
    [...postQueryKeys.all, postId, "comments", parentId ?? "root"] as const,
};
