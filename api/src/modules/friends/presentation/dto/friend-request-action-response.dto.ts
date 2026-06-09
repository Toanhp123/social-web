import { Expose, Type } from 'class-transformer';
import {
  FriendRequestResponseDto,
  FriendshipResponseDto,
} from '@/modules/friends/presentation/dto/friend-user-response.dto.js';
import { AcceptFriendRequestServiceResult } from '../../application/services/accept-friend-request.service.js';

export class AcceptFriendRequestResponseDto {
  @Expose()
  @Type(() => FriendRequestResponseDto)
  request!: FriendRequestResponseDto;

  @Expose()
  @Type(() => FriendshipResponseDto)
  friendship!: FriendshipResponseDto;

  static fromDomain(
    result: AcceptFriendRequestServiceResult,
  ): AcceptFriendRequestResponseDto {
    const dto = new AcceptFriendRequestResponseDto();

    dto.request = FriendRequestResponseDto.fromDomain(result.request);
    dto.friendship = FriendshipResponseDto.fromDomain(result.friendship);

    return dto;
  }
}
