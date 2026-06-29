import { Post } from '@/modules/posts/domain/entities/post.entity.js';

export type ListPostsCursor = {
  createdAt: Date;
  id: string;
  phase?: ListPostsPhase;
};

export type ListPostsPhase = 'feed' | 'discover';

export type ListPostsQuery = {
  viewerId?: string;
  authorId?: string;
  groupId?: string;
  groupFeed?: boolean;
  search?: string;
  limit: number;
  cursor?: ListPostsCursor;
};

export type ListPostsPage = {
  items: Post[];
  nextCursor: ListPostsCursor | null;
};
