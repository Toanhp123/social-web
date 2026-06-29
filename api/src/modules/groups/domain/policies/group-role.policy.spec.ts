import { GroupMemberRole } from '@/generated/prisma/client.js';
import { GroupRolePolicy } from './group-role.policy.js';

describe(GroupRolePolicy.name, () => {
  it('allows owner and admin to manage join requests', () => {
    expect(GroupRolePolicy.canManageRequests(GroupMemberRole.OWNER)).toBe(true);
    expect(GroupRolePolicy.canManageRequests(GroupMemberRole.ADMIN)).toBe(true);
    expect(GroupRolePolicy.canManageRequests(GroupMemberRole.MEMBER)).toBe(
      false,
    );
    expect(GroupRolePolicy.canManageRequests(null)).toBe(false);
  });

  it('lets owner change admin/member roles but never their own role', () => {
    expect(
      GroupRolePolicy.canChangeRole({
        actorUserId: 'owner-1',
        actorRole: GroupMemberRole.OWNER,
        targetUserId: 'member-1',
        targetRole: GroupMemberRole.MEMBER,
        nextRole: GroupMemberRole.ADMIN,
      }),
    ).toBe(true);

    expect(
      GroupRolePolicy.canChangeRole({
        actorUserId: 'owner-1',
        actorRole: GroupMemberRole.OWNER,
        targetUserId: 'owner-1',
        targetRole: GroupMemberRole.OWNER,
        nextRole: GroupMemberRole.MEMBER,
      }),
    ).toBe(false);
  });

  it('lets admin manage members but not owners or other admins', () => {
    expect(
      GroupRolePolicy.canChangeRole({
        actorUserId: 'admin-1',
        actorRole: GroupMemberRole.ADMIN,
        targetUserId: 'member-1',
        targetRole: GroupMemberRole.MEMBER,
        nextRole: GroupMemberRole.ADMIN,
      }),
    ).toBe(true);

    expect(
      GroupRolePolicy.canChangeRole({
        actorUserId: 'admin-1',
        actorRole: GroupMemberRole.ADMIN,
        targetUserId: 'admin-2',
        targetRole: GroupMemberRole.ADMIN,
        nextRole: GroupMemberRole.MEMBER,
      }),
    ).toBe(false);
  });

  it('prevents removing the owner and lets admin remove members only', () => {
    expect(
      GroupRolePolicy.canRemoveMember({
        actorUserId: 'owner-1',
        actorRole: GroupMemberRole.OWNER,
        targetUserId: 'admin-1',
        targetRole: GroupMemberRole.ADMIN,
      }),
    ).toBe(true);

    expect(
      GroupRolePolicy.canRemoveMember({
        actorUserId: 'admin-1',
        actorRole: GroupMemberRole.ADMIN,
        targetUserId: 'member-1',
        targetRole: GroupMemberRole.MEMBER,
      }),
    ).toBe(true);

    expect(
      GroupRolePolicy.canRemoveMember({
        actorUserId: 'admin-1',
        actorRole: GroupMemberRole.ADMIN,
        targetUserId: 'owner-1',
        targetRole: GroupMemberRole.OWNER,
      }),
    ).toBe(false);
  });
});
