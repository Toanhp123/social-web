export const postFeedQueryKeys = {
  all: ["post-feed"] as const,
  feed: (input?: { authorId?: string; search?: string }) =>
    [
      ...postFeedQueryKeys.all,
      input?.authorId ?? "all",
      input?.search?.trim() || "no-search",
    ] as const,
};
