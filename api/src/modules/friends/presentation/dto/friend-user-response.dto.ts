import { Expose, Type } from 'class-transformer';
import { FriendRequestStatus } from '@/generated/prisma/client.js';
import { FriendRequest } from '@/modules/friends/domain/entities/friend-request.entity.js';
import { FriendUser } from '@/modules/friends/domain/entities/friend-user.entity.js';
import { Friendship } from '@/modules/friends/domain/entities/friendship.entity.js';

export class FriendUserResponseDto {
  @Expose() id!: string;
  @Expose() fullName!: string;
  @Expose() username!: string | null;
  @Expose() avatarUrl!: string | null;

  static fromDomain(user: FriendUser): FriendUserResponseDto {
    const dto = new FriendUserResponseDto();

    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.username = user.username;
    dto.avatarUrl = user.avatarUrl;

    return dto;
  }
}

export class FriendRequestResponseDto {
  @Expose() id!: string;
  @Expose() status!: FriendRequestStatus;
  @Expose() createdAt!: string;
  @Expose() updatedAt!: string;

  @Expose()
  @Type(() => FriendUserResponseDto)
  requester!: FriendUserResponseDto;

  @Expose()
  @Type(() => FriendUserResponseDto)
  receiver!: FriendUserResponseDto;

  static fromDomain(request: FriendRequest): FriendRequestResponseDto {
    const dto = new FriendRequestResponseDto();

    dto.id = request.id;
    dto.status = request.status;
    dto.createdAt = request.createdAt.toISOString();
    dto.updatedAt = request.updatedAt.toISOString();
    dto.requester = FriendUserResponseDto.fromDomain(request.requester);
    dto.receiver = FriendUserResponseDto.fromDomain(request.receiver);

    return dto;
  }
}

export class FriendshipResponseDto {
  @Expose() createdAt!: string;

  @Expose()
  @Type(() => FriendUserResponseDto)
  user!: FriendUserResponseDto;

  static fromDomain(friendship: Friendship): FriendshipResponseDto {
    const dto = new FriendshipResponseDto();

    dto.createdAt = friendship.createdAt.toISOString();
    dto.user = FriendUserResponseDto.fromDomain(friendship.user);

    return dto;
  }
}
