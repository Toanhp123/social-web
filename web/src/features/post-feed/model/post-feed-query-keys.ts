export const postFeedQueryKeys = {
  all: ["post-feed"] as const,
  feed: (input?: { authorId?: string; groupId?: string; search?: string }) =>
    [
      ...postFeedQueryKeys.all,
      input?.authorId ?? "all",
      input?.groupId ?? "no-group",
      input?.search?.trim() || "no-search",
    ] as const,
};
