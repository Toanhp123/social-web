import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { FollowUserService } from '@/modules/follows/application/services/follow-user.service.js';
import { GetFollowStatusService } from '@/modules/follows/application/services/get-follow-status.service.js';
import { ListFollowersService } from '@/modules/follows/application/services/list-followers.service.js';
import { ListFollowingService } from '@/modules/follows/application/services/list-following.service.js';
import { UnfollowUserService } from '@/modules/follows/application/services/unfollow-user.service.js';
import {
  FollowResponseDto,
  FollowStatusResponseDto,
} from '@/modules/follows/presentation/dto/follow-response.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('follows')
export class FollowController {
  constructor(
    private readonly followUserService: FollowUserService,
    private readonly unfollowUserService: UnfollowUserService,
    private readonly getFollowStatusService: GetFollowStatusService,
    private readonly listFollowersService: ListFollowersService,
    private readonly listFollowingService: ListFollowingService,
  ) {}

  @Get('followers')
  async listFollowers(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FollowResponseDto[]> {
    const followers = await this.listFollowersService.execute({
      userId: currentUser.userId,
    });

    return followers.map((follow) => FollowResponseDto.fromDomain(follow));
  }

  @Get('following')
  async listFollowing(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FollowResponseDto[]> {
    const following = await this.listFollowingService.execute({
      userId: currentUser.userId,
    });

    return following.map((follow) => FollowResponseDto.fromDomain(follow));
  }

  @Get(':userId/status')
  async getStatus(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FollowStatusResponseDto> {
    const status = await this.getFollowStatusService.execute({
      followerId: currentUser.userId,
      followingId: userId,
    });

    return FollowStatusResponseDto.fromDomain(status);
  }

  @Post(':userId')
  async followUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FollowStatusResponseDto> {
    const status = await this.followUserService.execute({
      followerId: currentUser.userId,
      followingId: userId,
    });

    return FollowStatusResponseDto.fromDomain(status);
  }

  @Delete(':userId')
  async unfollowUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FollowStatusResponseDto> {
    const status = await this.unfollowUserService.execute({
      followerId: currentUser.userId,
      followingId: userId,
    });

    return FollowStatusResponseDto.fromDomain(status);
  }
}
