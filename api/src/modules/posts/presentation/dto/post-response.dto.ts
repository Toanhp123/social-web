import { Expose, Type } from 'class-transformer';
import {
  MediaType,
  PostType,
  PostVisibility,
  ReactionType,
} from '@/generated/prisma/client.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';

export class PostAuthorResponseDto {
  @Expose() id!: string;
  @Expose() fullName!: string;
  @Expose() username!: string | null;
  @Expose() avatarUrl!: string | null;
}

export class PostMediaResponseDto {
  @Expose() id!: string;
  @Expose() url!: string;
  @Expose() thumbnailUrl!: string | null;
  @Expose() mimeType!: string | null;
  @Expose() size!: number | null;
  @Expose() type!: MediaType;
  @Expose() width!: number | null;
  @Expose() height!: number | null;
  @Expose() duration!: number | null;
  @Expose() order!: number;
  @Expose() alt!: string | null;
}

export class PostReactionStatsResponseDto {
  @Expose() likeCount!: number;
  @Expose() loveCount!: number;
  @Expose() hahaCount!: number;
  @Expose() wowCount!: number;
  @Expose() sadCount!: number;
  @Expose() angryCount!: number;
  @Expose() totalReactionCount!: number;
  @Expose() commentCount!: number;
  @Expose() shareCount!: number;
}

export class PostResponseDto {
  @Expose() id!: string;
  @Expose() content!: string;
  @Expose() type!: PostType;
  @Expose() visibility!: PostVisibility;
  @Expose() originalPostId!: string | null;
  @Expose() createdAt!: string;
  @Expose() updatedAt!: string;
  @Expose() currentReaction!: ReactionType | null;

  @Expose()
  @Type(() => PostAuthorResponseDto)
  author!: PostAuthorResponseDto;

  @Expose()
  @Type(() => PostMediaResponseDto)
  media!: PostMediaResponseDto[];

  @Expose()
  @Type(() => PostReactionStatsResponseDto)
  reactionStats!: PostReactionStatsResponseDto;

  static fromDomain(post: Post): PostResponseDto {
    const dto = new PostResponseDto();

    dto.id = post.id;
    dto.content = post.content;
    dto.type = post.type;
    dto.visibility = post.visibility;
    dto.originalPostId = post.originalPostId;
    dto.createdAt = post.createdAt.toISOString();
    dto.updatedAt = post.updatedAt.toISOString();
    dto.currentReaction = post.currentReaction;
    dto.author = {
      id: post.author.id,
      fullName: post.author.fullName,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
    };
    dto.media = post.media.map((media) => ({
      id: media.id,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      mimeType: media.mimeType,
      size: media.size,
      type: media.type,
      width: media.width,
      height: media.height,
      duration: media.duration,
      order: media.order,
      alt: media.alt,
    }));
    dto.reactionStats = {
      likeCount: post.reactionStats.likeCount,
      loveCount: post.reactionStats.loveCount,
      hahaCount: post.reactionStats.hahaCount,
      wowCount: post.reactionStats.wowCount,
      sadCount: post.reactionStats.sadCount,
      angryCount: post.reactionStats.angryCount,
      totalReactionCount: post.reactionStats.totalReactionCount,
      commentCount: post.reactionStats.commentCount,
      shareCount: post.reactionStats.shareCount,
    };

    return dto;
  }
}
