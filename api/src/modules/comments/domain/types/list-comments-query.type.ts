import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';

export type ListCommentsCursor = {
  createdAt: Date;
  id: string;
};

export type ListCommentsQuery = {
  postId: string;
  viewerId?: string;
  parentId?: string;
  limit: number;
  cursor?: ListCommentsCursor;
};

export type ListCommentsPage = {
  items: Comment[];
  nextCursor: ListCommentsCursor | null;
};
