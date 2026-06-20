import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '@/core/security/guards/optional-jwt-auth.guard.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { CreateGroupService } from '@/modules/groups/application/services/create-group.service.js';
import { GetGroupService } from '@/modules/groups/application/services/get-group.service.js';
import { JoinGroupService } from '@/modules/groups/application/services/join-group.service.js';
import { ListGroupJoinRequestsService } from '@/modules/groups/application/services/list-group-join-requests.service.js';
import { ListGroupsService } from '@/modules/groups/application/services/list-groups.service.js';
import { ReviewGroupJoinRequestService } from '@/modules/groups/application/services/review-group-join-request.service.js';
import { CreateGroupInputDto } from '@/modules/groups/presentation/dto/create-group-input.dto.js';
import {
  GroupJoinRequestResponseDto,
  GroupPageResponseDto,
  GroupResponseDto,
  JoinGroupResponseDto,
} from '@/modules/groups/presentation/dto/group-response.dto.js';
import { ListGroupsQueryDto } from '@/modules/groups/presentation/dto/list-groups-query.dto.js';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly createGroupService: CreateGroupService,
    private readonly getGroupService: GetGroupService,
    private readonly joinGroupService: JoinGroupService,
    private readonly listGroupsService: ListGroupsService,
    private readonly listGroupJoinRequestsService: ListGroupJoinRequestsService,
    private readonly reviewGroupJoinRequestService: ReviewGroupJoinRequestService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async listGroups(
    @Query() query: ListGroupsQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser | null,
  ): Promise<GroupPageResponseDto> {
    const page = await this.listGroupsService.execute({
      viewerId: currentUser?.userId,
      search: query.search,
      limit: query.limit,
      cursor: query.cursor,
    });

    return GroupPageResponseDto.fromDomain(page);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createGroup(
    @Body() dto: CreateGroupInputDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GroupResponseDto> {
    const group = await this.createGroupService.execute({
      ownerId: currentUser.userId,
      name: dto.name,
      description: dto.description,
      privacy: dto.privacy,
    });

    return GroupResponseDto.fromDomain(group);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':groupId')
  async getGroup(
    @Param('groupId') groupId: string,
    @CurrentUser() currentUser: AuthenticatedUser | null,
  ): Promise<GroupResponseDto> {
    const group = await this.getGroupService.execute({
      groupId,
      viewerId: currentUser?.userId,
    });

    return GroupResponseDto.fromDomain(group);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':groupId/join')
  async joinGroup(
    @Param('groupId') groupId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<JoinGroupResponseDto> {
    const result = await this.joinGroupService.execute({
      groupId,
      userId: currentUser.userId,
    });

    return {
      status: result.status,
      group: GroupResponseDto.fromDomain(result.group),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':groupId/join-requests')
  async listJoinRequests(
    @Param('groupId') groupId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GroupJoinRequestResponseDto[]> {
    const requests = await this.listGroupJoinRequestsService.execute({
      groupId,
      userId: currentUser.userId,
    });

    return requests.map((request) =>
      GroupJoinRequestResponseDto.fromDomain(request),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':groupId/join-requests/:requestId/approve')
  async approveJoinRequest(
    @Param('groupId') groupId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GroupJoinRequestResponseDto> {
    const request = await this.reviewGroupJoinRequestService.approve({
      groupId,
      requestId,
      actorId: currentUser.userId,
    });

    return GroupJoinRequestResponseDto.fromDomain(request);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':groupId/join-requests/:requestId/reject')
  async rejectJoinRequest(
    @Param('groupId') groupId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GroupJoinRequestResponseDto> {
    const request = await this.reviewGroupJoinRequestService.reject({
      groupId,
      requestId,
      actorId: currentUser.userId,
    });

    return GroupJoinRequestResponseDto.fromDomain(request);
  }
}
