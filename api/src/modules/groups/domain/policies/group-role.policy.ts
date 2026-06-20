import { GroupMemberRole } from '@/generated/prisma/client.js';

type RoleInput = GroupMemberRole | null | undefined;

type RoleChangeInput = {
  actorUserId: string;
  actorRole: RoleInput;
  targetUserId: string;
  targetRole: RoleInput;
  nextRole: GroupMemberRole;
};

type MemberRemovalInput = {
  actorUserId: string;
  actorRole: RoleInput;
  targetUserId: string;
  targetRole: RoleInput;
};

export class GroupRolePolicy {
  static canPost(role: RoleInput): boolean {
    return Boolean(role);
  }

  static canManageRequests(role: RoleInput): boolean {
    return role === GroupMemberRole.OWNER || role === GroupMemberRole.ADMIN;
  }

  static canChangeRole(input: RoleChangeInput): boolean {
    if (!input.actorRole || !input.targetRole) {
      return false;
    }

    if (input.actorUserId === input.targetUserId) {
      return false;
    }

    if (input.nextRole === GroupMemberRole.OWNER) {
      return false;
    }

    if (input.targetRole === GroupMemberRole.OWNER) {
      return false;
    }

    if (input.actorRole === GroupMemberRole.OWNER) {
      return true;
    }

    return (
      input.actorRole === GroupMemberRole.ADMIN &&
      input.targetRole === GroupMemberRole.MEMBER
    );
  }

  static canRemoveMember(input: MemberRemovalInput): boolean {
    if (!input.actorRole || !input.targetRole) {
      return false;
    }

    if (input.actorUserId === input.targetUserId) {
      return false;
    }

    if (input.targetRole === GroupMemberRole.OWNER) {
      return false;
    }

    if (input.actorRole === GroupMemberRole.OWNER) {
      return true;
    }

    return (
      input.actorRole === GroupMemberRole.ADMIN &&
      input.targetRole === GroupMemberRole.MEMBER
    );
  }
}
