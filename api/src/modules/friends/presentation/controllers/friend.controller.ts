import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { ListFriendsService } from '@/modules/friends/application/services/list-friends.service.js';
import { RemoveFriendService } from '@/modules/friends/application/services/remove-friend.service.js';
import { FriendshipResponseDto } from '@/modules/friends/presentation/dto/friend-user-response.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendController {
  constructor(
    private readonly listFriendsService: ListFriendsService,
    private readonly removeFriendService: RemoveFriendService,
  ) {}

  @Get()
  async listFriends(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FriendshipResponseDto[]> {
    const friends = await this.listFriendsService.execute({
      userId: currentUser.userId,
    });

    return friends.map((friendship) =>
      FriendshipResponseDto.fromDomain(friendship),
    );
  }

  @Delete(':friendId')
  @HttpCode(204)
  async removeFriend(
    @Param('friendId') friendId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.removeFriendService.execute({
      userId: currentUser.userId,
      friendId,
    });
  }
}
