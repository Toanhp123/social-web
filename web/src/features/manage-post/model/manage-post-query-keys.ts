export const managePostQueryKeys = {
  all: ["manage-post"] as const,

  reportStatus: (postId: string) =>
    [...managePostQueryKeys.all, "report-status", postId] as const,
};
