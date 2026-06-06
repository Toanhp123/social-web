export type CreateCommentInput = {
  userId: string;
  postId: string;
  content: string;
  parentId?: string;
};
