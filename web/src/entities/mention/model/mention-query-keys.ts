export const mentionQueryKeys = {
  all: ["mentions"] as const,

  candidates: (query: string) =>
    [...mentionQueryKeys.all, "candidates", query] as const,

  resolve: (username: string) =>
    [...mentionQueryKeys.all, "resolve", username] as const,
};
