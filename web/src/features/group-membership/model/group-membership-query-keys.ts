export const groupQueryKeys = {
  all: ["groups"] as const,
  lists: () => [...groupQueryKeys.all, "list"] as const,
  list: (input?: { search?: string | null }) =>
    [...groupQueryKeys.lists(), input?.search?.trim() || "all"] as const,
  detail: (groupId: string) =>
    [...groupQueryKeys.all, "detail", groupId] as const,
  members: (groupId: string) =>
    [...groupQueryKeys.all, "members", groupId] as const,
  joinRequests: (groupId: string) =>
    [...groupQueryKeys.all, "join-requests", groupId] as const,
};
