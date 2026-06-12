export const searchQueryKeys = {
  all: ["search"] as const,
  preview: (query: string) =>
    [...searchQueryKeys.all, "preview", query] as const,
  users: (query: string) => [...searchQueryKeys.all, "users", query] as const,
};
