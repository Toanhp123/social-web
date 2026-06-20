import {
  Body,
  Controller,
  Get,
  Delete,
  Patch,
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
import { ListGroupMembersService } from '@/modules/groups/application/services/list-group-members.service.js';
import { ListGroupJoinRequestsService } from '@/modules/groups/application/services/list-group-join-requests.service.js';
import { ListGroupsService } from '@/modules/groups/application/services/list-groups.service.js';
import { RemoveGroupMemberService } from '@/modules/groups/application/services/remove-group-member.service.js';
import { ReviewGroupJoinRequestService } from '@/modules/groups/application/services/review-group-join-request.service.js';
import { UpdateGroupMemberRoleService } from '@/modules/groups/application/services/update-group-member-role.service.js';
import { CreateGroupInputDto } from '@/modules/groups/presentation/dto/create-group-input.dto.js';
import {
  GroupJoinRequestResponseDto,
  GroupMemberResponseDto,
  GroupPageResponseDto,
  GroupResponseDto,
  JoinGroupResponseDto,
} from '@/modules/groups/presentation/dto/group-response.dto.js';
import { ListGroupsQueryDto } from '@/modules/groups/presentation/dto/list-groups-query.dto.js';
import { UpdateGroupMemberRoleInputDto } from '@/modules/groups/presentation/dto/update-group-member-role-input.dto.js';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly createGroupService: CreateGroupService,
    private readonly getGroupService: GetGroupService,
    private readonly joinGroupService: JoinGroupService,
    private readonly listGroupMembersService: ListGroupMembersService,
    private readonly listGroupsService: ListGroupsService,
    private readonly listGroupJoinRequestsService: ListGroupJoinRequestsService,
    private readonly removeGroupMemberService: RemoveGroupMemberService,
    private readonly reviewGroupJoinRequestService: ReviewGroupJoinRequestService,
    private readonly updateGroupMemberRoleService: UpdateGroupMemberRoleService,
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
  @Get(':groupId/members')
  async listMembers(
    @Param('groupId') groupId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GroupMemberResponseDto[]> {
    const members = await this.listGroupMembersService.execute({
      groupId,
      viewerId: currentUser.userId,
    });

    return members.map((member) => GroupMemberResponseDto.fromDomain(member));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':groupId/members/:userId/role')
  async updateMemberRole(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateGroupMemberRoleInputDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<GroupMemberResponseDto> {
    const member = await this.updateGroupMemberRoleService.execute({
      groupId,
      userId,
      actorId: currentUser.userId,
      role: dto.role,
    });

    return GroupMemberResponseDto.fromDomain(member);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':groupId/members/:userId')
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.removeGroupMemberService.execute({
      groupId,
      userId,
      actorId: currentUser.userId,
    });
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
