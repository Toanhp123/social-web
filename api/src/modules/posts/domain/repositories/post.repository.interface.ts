import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { CreatePostInput } from '@/modules/posts/domain/types/create-post-input.type.js';

export abstract class PostRepository {
  abstract create(input: CreatePostInput): Promise<Post>;
}
