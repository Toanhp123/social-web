export const postFeedQueryKeys = {
  all: ["post-feed"] as const,
  feed: (input?: {
    authorId?: string;
    groupId?: string;
    groupFeed?: boolean;
    search?: string;
  }) =>
    [
      ...postFeedQueryKeys.all,
      input?.authorId ?? "all",
      input?.groupId ?? "no-group",
      input?.groupFeed ? "group-feed" : "standard-feed",
      input?.search?.trim() || "no-search",
    ] as const,
};
