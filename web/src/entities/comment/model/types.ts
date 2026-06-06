export type CommentAuthor = {
  id: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
};

export type Comment = {
  id: string;
  postId: string;
  parentId: string | null;
  rootId: string;
  path: string;
  depth: number;
  content: string;
  replyCount: number;
  reactionCount: number;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
};

export type CommentPage = {
  items: Comment[];
  nextCursor: string | null;
};
