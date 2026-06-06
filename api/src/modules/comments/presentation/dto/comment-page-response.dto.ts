import { Expose, Type } from 'class-transformer';
import { ListCommentsResult } from '@/modules/comments/application/services/list-comments.service.js';
import { CommentResponseDto } from '@/modules/comments/presentation/dto/comment-response.dto.js';

export class CommentPageResponseDto {
  @Expose()
  @Type(() => CommentResponseDto)
  items!: CommentResponseDto[];

  @Expose() nextCursor!: string | null;

  static fromDomain(result: ListCommentsResult): CommentPageResponseDto {
    const dto = new CommentPageResponseDto();

    dto.items = result.items.map((comment) =>
      CommentResponseDto.fromDomain(comment),
    );
    dto.nextCursor = result.nextCursor;

    return dto;
  }
}
