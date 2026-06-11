export const postFeedQueryKeys = {
  all: ["post-feed"] as const,
  feed: (input?: { authorId?: string }) =>
    [...postFeedQueryKeys.all, input?.authorId ?? "all"] as const,
};
