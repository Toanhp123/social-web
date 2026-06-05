import { Post } from '@/modules/posts/domain/entities/post.entity.js';

export type ListPostsCursor = {
  createdAt: Date;
  id: string;
};

export type ListPostsQuery = {
  viewerId: string;
  limit: number;
  cursor?: ListPostsCursor;
};

export type ListPostsPage = {
  items: Post[];
  nextCursor: ListPostsCursor | null;
};
