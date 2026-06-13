import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostReactionStats } from '@/modules/posts/domain/entities/post-reaction-stats.entity.js';
import { CreatePostInput } from '@/modules/posts/domain/types/create-post-input.type.js';
import {
  ListPostsPage,
  ListPostsQuery,
} from '@/modules/posts/domain/types/list-posts-query.type.js';
import { SharePostInput } from '@/modules/posts/domain/types/share-post-input.type.js';

export abstract class PostRepository {
  abstract create(input: CreatePostInput): Promise<Post>;
  abstract share(input: SharePostInput): Promise<Post>;
  abstract softDelete(input: {
    postId: string;
    deletedById: string;
  }): Promise<void>;
  abstract report(input: {
    postId: string;
    reporterId: string;
    reason?: string | null;
  }): Promise<void>;
  abstract cancelReport(input: {
    postId: string;
    reporterId: string;
  }): Promise<boolean>;
  abstract hasReportedPost(input: {
    postId: string;
    reporterId: string;
  }): Promise<boolean>;
  abstract findPage(query: ListPostsQuery): Promise<ListPostsPage>;
  abstract findDiscoveryPage(
    query: ListPostsQuery & { viewerId: string },
  ): Promise<ListPostsPage>;
  abstract findAuthorId(postId: string): Promise<string | null>;
  abstract findReactionStats(input: {
    postId: string;
    viewerId?: string;
  }): Promise<PostReactionStats | null>;
}
