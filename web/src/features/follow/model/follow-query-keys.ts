export const followQueryKeys = {
  all: ["follow"] as const,

  status: (userId: string) =>
    [...followQueryKeys.all, "status", userId] as const,

  followers: () => [...followQueryKeys.all, "followers"] as const,

  following: () => [...followQueryKeys.all, "following"] as const,
};
