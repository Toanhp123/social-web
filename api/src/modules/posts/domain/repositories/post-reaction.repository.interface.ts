import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import {
  RemovePostReactionInput,
  SetPostReactionInput,
} from '@/modules/posts/domain/types/post-reaction.type.js';

export abstract class PostReactionRepository {
  abstract set(input: SetPostReactionInput): Promise<Post>;
  abstract remove(input: RemovePostReactionInput): Promise<Post>;
}
