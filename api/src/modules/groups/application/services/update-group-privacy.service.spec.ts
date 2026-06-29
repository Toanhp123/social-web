import { jest } from '@jest/globals';
import { GroupMemberRole, GroupPrivacy } from '@/generated/prisma/client.js';
import { UpdateGroupPrivacyService } from './update-group-privacy.service.js';

describe(UpdateGroupPrivacyService.name, () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates privacy and notifies existing members except the actor', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(123);

    const groupRepository = {
      findMembership: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        groupId: 'group-1',
        userId: 'admin-1',
        role: GroupMemberRole.ADMIN,
      }),
      findById: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        id: 'group-1',
        privacy: GroupPrivacy.PUBLIC,
      }),
      updatePrivacy: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        id: 'group-1',
        privacy: GroupPrivacy.PRIVATE,
      }),
      listMembers: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([
        {
          groupId: 'group-1',
          userId: 'admin-1',
          role: GroupMemberRole.ADMIN,
        },
        {
          groupId: 'group-1',
          userId: 'member-1',
          role: GroupMemberRole.MEMBER,
        },
      ]),
    };
    const createNotificationService = {
      execute: jest.fn<() => Promise<unknown>>().mockResolvedValue(null),
    };
    const service = new UpdateGroupPrivacyService(
      groupRepository as never,
      createNotificationService as never,
    );

    await service.execute({
      groupId: 'group-1',
      actorId: 'admin-1',
      privacy: GroupPrivacy.PRIVATE,
    });

    expect(groupRepository.updatePrivacy).toHaveBeenCalledWith({
      groupId: 'group-1',
      viewerId: 'admin-1',
      privacy: GroupPrivacy.PRIVATE,
    });
    expect(createNotificationService.execute).toHaveBeenCalledTimes(1);
    expect(createNotificationService.execute).toHaveBeenCalledWith({
      userId: 'member-1',
      actorId: 'admin-1',
      type: 'GROUP_PRIVACY_CHANGED',
      refId: 'group-1',
      aggregateKey: 'group-privacy:group-1:PRIVATE:123',
    });
  });

  it('does not update or notify when privacy is unchanged', async () => {
    const groupRepository = {
      findMembership: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        groupId: 'group-1',
        userId: 'admin-1',
        role: GroupMemberRole.ADMIN,
      }),
      findById: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        id: 'group-1',
        privacy: GroupPrivacy.PRIVATE,
      }),
      updatePrivacy: jest.fn<() => Promise<unknown>>(),
      listMembers: jest.fn<() => Promise<unknown[]>>(),
    };
    const createNotificationService = {
      execute: jest.fn<() => Promise<unknown>>().mockResolvedValue(null),
    };
    const service = new UpdateGroupPrivacyService(
      groupRepository as never,
      createNotificationService as never,
    );

    await service.execute({
      groupId: 'group-1',
      actorId: 'admin-1',
      privacy: GroupPrivacy.PRIVATE,
    });

    expect(groupRepository.updatePrivacy).not.toHaveBeenCalled();
    expect(groupRepository.listMembers).not.toHaveBeenCalled();
    expect(createNotificationService.execute).not.toHaveBeenCalled();
  });
});
