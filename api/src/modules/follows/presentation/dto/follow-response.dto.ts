import { Expose, Type } from 'class-transformer';
import { Follow } from '@/modules/follows/domain/entities/follow.entity.js';
import { FollowStatus } from '@/modules/follows/domain/entities/follow-status.entity.js';
import { FollowUser } from '@/modules/follows/domain/entities/follow-user.entity.js';

export class FollowUserResponseDto {
  @Expose() id!: string;
  @Expose() fullName!: string;
  @Expose() username!: string | null;
  @Expose() avatarUrl!: string | null;

  static fromDomain(user: FollowUser): FollowUserResponseDto {
    const dto = new FollowUserResponseDto();

    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.username = user.username;
    dto.avatarUrl = user.avatarUrl;

    return dto;
  }
}

export class FollowResponseDto {
  @Expose() createdAt!: string;

  @Expose()
  @Type(() => FollowUserResponseDto)
  user!: FollowUserResponseDto;

  static fromDomain(follow: Follow): FollowResponseDto {
    const dto = new FollowResponseDto();

    dto.createdAt = follow.createdAt.toISOString();
    dto.user = FollowUserResponseDto.fromDomain(follow.user);

    return dto;
  }
}

export class FollowStatusResponseDto {
  @Expose() isFollowing!: boolean;
  @Expose() followerCount!: number;
  @Expose() followingCount!: number;

  static fromDomain(status: FollowStatus): FollowStatusResponseDto {
    const dto = new FollowStatusResponseDto();

    dto.isFollowing = status.isFollowing;
    dto.followerCount = status.followerCount;
    dto.followingCount = status.followingCount;

    return dto;
  }
}
