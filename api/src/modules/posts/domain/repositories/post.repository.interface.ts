import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { CreatePostInput } from '@/modules/posts/domain/types/create-post-input.type.js';
import {
  ListPostsPage,
  ListPostsQuery,
} from '@/modules/posts/domain/types/list-posts-query.type.js';

export abstract class PostRepository {
  abstract create(input: CreatePostInput): Promise<Post>;
  abstract findPage(query: ListPostsQuery): Promise<ListPostsPage>;
}
