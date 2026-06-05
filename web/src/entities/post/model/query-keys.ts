export const postQueryKeys = {
  all: ["posts"] as const,
  feed: () => [...postQueryKeys.all, "feed"] as const,
};
