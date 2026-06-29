import { IsIn } from 'class-validator';
import { GroupMemberRole } from '@/generated/prisma/client.js';
import type { ManageableGroupMemberRole } from '@/modules/groups/domain/types/group.type.js';

const MANAGEABLE_GROUP_MEMBER_ROLES = [
  GroupMemberRole.ADMIN,
  GroupMemberRole.MEMBER,
] as const satisfies readonly ManageableGroupMemberRole[];

export class UpdateGroupMemberRoleInputDto {
  @IsIn(MANAGEABLE_GROUP_MEMBER_ROLES)
  role!: ManageableGroupMemberRole;
}
