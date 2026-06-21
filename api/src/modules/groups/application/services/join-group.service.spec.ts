import { jest } from '@jest/globals';
import { GroupPrivacy } from '@/generated/prisma/client.js';
import { JoinGroupService } from './join-group.service.js';

describe(JoinGroupService.name, () => {
  it('joins a public group immediately', async () => {
    const groupRepository = {
      findById: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        id: 'group-1',
        privacy: GroupPrivacy.PUBLIC,
      }),
      findMembership: jest.fn<() => Promise<unknown>>().mockResolvedValue(null),
      findPendingJoinRequest: jest.fn<() => Promise<unknown>>(),
      addMember: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        groupId: 'group-1',
        userId: 'user-1',
        role: 'MEMBER',
      }),
      createJoinRequest: jest.fn<() => Promise<unknown>>(),
    };
    const postFeedCacheInvalidation = {
      invalidateViewer: jest.fn<() => Promise<void>>().mockResolvedValue(),
    };
    const service = new JoinGroupService(
      groupRepository as never,
      postFeedCacheInvalidation as never,
    );

    const result = await service.execute({
      groupId: 'group-1',
      userId: 'user-1',
    });

    expect(result.status).toBe('member');
    expect(groupRepository.addMember).toHaveBeenCalledWith({
      groupId: 'group-1',
      userId: 'user-1',
      role: 'MEMBER',
    });
    expect(groupRepository.createJoinRequest).not.toHaveBeenCalled();
    expect(postFeedCacheInvalidation.invalidateViewer).toHaveBeenCalledWith(
      'user-1',
    );
  });

  it('creates a pending request for a private group', async () => {
    const groupRepository = {
      findById: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        id: 'group-1',
        privacy: GroupPrivacy.PRIVATE,
      }),
      findMembership: jest.fn<() => Promise<unknown>>().mockResolvedValue(null),
      findPendingJoinRequest: jest
        .fn<() => Promise<unknown>>()
        .mockResolvedValue(null),
      addMember: jest.fn<() => Promise<unknown>>(),
      createJoinRequest: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        id: 'request-1',
        groupId: 'group-1',
        requesterId: 'user-1',
        status: 'PENDING',
      }),
    };
    const postFeedCacheInvalidation = {
      invalidateViewer: jest.fn<() => Promise<void>>().mockResolvedValue(),
    };
    const service = new JoinGroupService(
      groupRepository as never,
      postFeedCacheInvalidation as never,
    );

    const result = await service.execute({
      groupId: 'group-1',
      userId: 'user-1',
    });

    expect(result.status).toBe('pending');
    expect(groupRepository.createJoinRequest).toHaveBeenCalledWith({
      groupId: 'group-1',
      requesterId: 'user-1',
    });
    expect(groupRepository.addMember).not.toHaveBeenCalled();
    expect(postFeedCacheInvalidation.invalidateViewer).not.toHaveBeenCalled();
  });
});
