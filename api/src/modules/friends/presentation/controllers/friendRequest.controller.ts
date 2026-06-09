import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { CancelFriendRequestService } from '@/modules/friends/application/services/cancel-friend-request.service.js';
import { ListFriendRequestsService } from '@/modules/friends/application/services/list-friend-requests.service.js';
import { SendFriendRequestService } from '@/modules/friends/application/services/send-friend-request.service.js';
import { AcceptFriendRequestResponseDto } from '@/modules/friends/presentation/dto/friend-request-action-response.dto.js';
import { FriendRequestResponseDto } from '@/modules/friends/presentation/dto/friend-user-response.dto.js';
import { RejectFriendRequestService } from '@/modules/friends/application/services/reject-friend-request.service.js';
import { AcceptFriendRequestService } from '@/modules/friends/application/services/accept-friend-request.service.js';

@UseGuards(JwtAuthGuard)
@Controller('friend-requests')
export class FriendRequestController {
  constructor(
    private readonly sendFriendRequestService: SendFriendRequestService,
    private readonly acceptFriendRequestService: AcceptFriendRequestService,
    private readonly rejectFriendRequestService: RejectFriendRequestService,
    private readonly cancelFriendRequestService: CancelFriendRequestService,
    private readonly listFriendRequestsService: ListFriendRequestsService,
  ) {}

  @Post('to/:receiverId')
  async sendRequest(
    @Param('receiverId') receiverId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FriendRequestResponseDto> {
    const request = await this.sendFriendRequestService.execute({
      requesterId: currentUser.userId,
      receiverId,
    });

    return FriendRequestResponseDto.fromDomain(request);
  }

  @Get('incoming')
  async listIncomingRequests(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FriendRequestResponseDto[]> {
    const requests = await this.listFriendRequestsService.execute({
      userId: currentUser.userId,
      direction: 'incoming',
    });

    return requests.map((request) =>
      FriendRequestResponseDto.fromDomain(request),
    );
  }

  @Get('outgoing')
  async listOutgoingRequests(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FriendRequestResponseDto[]> {
    const requests = await this.listFriendRequestsService.execute({
      userId: currentUser.userId,
      direction: 'outgoing',
    });

    return requests.map((request) =>
      FriendRequestResponseDto.fromDomain(request),
    );
  }

  @Post(':requestId/accept')
  async acceptRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AcceptFriendRequestResponseDto> {
    const result = await this.acceptFriendRequestService.execute({
      requestId,
      userId: currentUser.userId,
    });

    return AcceptFriendRequestResponseDto.fromDomain(result);
  }

  @Post(':requestId/reject')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FriendRequestResponseDto> {
    const request = await this.rejectFriendRequestService.execute({
      requestId,
      userId: currentUser.userId,
    });

    return FriendRequestResponseDto.fromDomain(request);
  }

  @Delete(':requestId')
  @HttpCode(204)
  async cancelRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.cancelFriendRequestService.execute({
      requestId,
      userId: currentUser.userId,
    });
  }
}
