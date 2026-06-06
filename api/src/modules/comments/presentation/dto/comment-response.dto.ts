import { Expose, Type } from 'class-transformer';
import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';

export class CommentAuthorResponseDto {
  @Expose() id!: string;
  @Expose() fullName!: string;
  @Expose() username!: string | null;
  @Expose() avatarUrl!: string | null;
}

export class CommentResponseDto {
  @Expose() id!: string;
  @Expose() postId!: string;
  @Expose() parentId!: string | null;
  @Expose() rootId!: string;
  @Expose() path!: string;
  @Expose() depth!: number;
  @Expose() content!: string;
  @Expose() replyCount!: number;
  @Expose() reactionCount!: number;
  @Expose() createdAt!: string;
  @Expose() updatedAt!: string;

  @Expose()
  @Type(() => CommentAuthorResponseDto)
  author!: CommentAuthorResponseDto;

  static fromDomain(comment: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();

    dto.id = comment.id;
    dto.postId = comment.postId;
    dto.parentId = comment.parentId;
    dto.rootId = comment.rootId;
    dto.path = comment.path;
    dto.depth = comment.depth;
    dto.content = comment.content;
    dto.replyCount = comment.replyCount;
    dto.reactionCount = comment.reactionCount;
    dto.createdAt = comment.createdAt.toISOString();
    dto.updatedAt = comment.updatedAt.toISOString();
    dto.author = {
      id: comment.author.id,
      fullName: comment.author.fullName,
      username: comment.author.username,
      avatarUrl: comment.author.avatarUrl,
    };

    return dto;
  }
}
