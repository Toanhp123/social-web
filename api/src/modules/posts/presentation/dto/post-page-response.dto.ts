import { Expose, Type } from 'class-transformer';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostResponseDto } from '@/modules/posts/presentation/dto/post-response.dto.js';

export class PostPageResponseDto {
  @Expose()
  @Type(() => PostResponseDto)
  items!: PostResponseDto[];

  @Expose() nextCursor!: string | null;

  static fromDomain(input: {
    items: Post[];
    nextCursor: string | null;
  }): PostPageResponseDto {
    const dto = new PostPageResponseDto();

    dto.items = input.items.map((post) => PostResponseDto.fromDomain(post));
    dto.nextCursor = input.nextCursor;

    return dto;
  }
}
