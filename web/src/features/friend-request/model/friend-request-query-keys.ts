export const friendRequestQueryKeys = {
  all: ["friend-request"] as const,

  incoming: () => [...friendRequestQueryKeys.all, "incoming"] as const,

  outgoing: () => [...friendRequestQueryKeys.all, "outgoing"] as const,
};
