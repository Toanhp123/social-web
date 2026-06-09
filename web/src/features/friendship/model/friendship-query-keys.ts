export const friendshipQueryKeys = {
  all: ["friendship"] as const,

  friends: () => [...friendshipQueryKeys.all, "friends"] as const,
};
