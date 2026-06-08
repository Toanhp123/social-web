import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';
import { CreateCommentInput } from '@/modules/comments/domain/types/create-comment-input.type.js';
import {
  ListCommentsPage,
  ListCommentsQuery,
} from '@/modules/comments/domain/types/list-comments-query.type.js';

export abstract class CommentRepository {
  abstract create(input: CreateCommentInput): Promise<Comment>;
  abstract findPage(query: ListCommentsQuery): Promise<ListCommentsPage>;
  abstract findAuthorId(commentId: string): Promise<string | null>;
}
