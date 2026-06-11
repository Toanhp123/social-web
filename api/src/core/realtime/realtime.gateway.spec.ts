import { jest } from '@jest/globals';
import { RealtimeGateway } from './realtime.gateway.js';
import type { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import type { PostAccessService } from './post-access.service.js';

describe('RealtimeGateway', () => {
  it('joins a post room when the viewer can access the post topic', async () => {
    const postAccess = {
      canViewPost: jest.fn().mockResolvedValue(true),
    } as unknown as PostAccessService;
    const gateway = new RealtimeGateway(
      {} as never,
      {} as never,
      {} as AuthAccountRepository,
      postAccess,
    );
    const client = {
      data: { userId: 'viewer-1' },
      id: 'socket-1',
      join: jest.fn().mockResolvedValue(undefined),
    };

    const result = await gateway.handleSubscribe(client as never, {
      topic: 'post',
      postId: 'post-1',
    });

    expect(postAccess.canViewPost).toHaveBeenCalledWith({
      postId: 'post-1',
      viewerId: 'viewer-1',
    });
    expect(client.join).toHaveBeenCalledWith('post:post-1');
    expect(result.type).toBe('realtime.subscribed');
  });

  it('does not join a post room when the viewer cannot access the post topic', async () => {
    const postAccess = {
      canViewPost: jest.fn().mockResolvedValue(false),
    } as unknown as PostAccessService;
    const gateway = new RealtimeGateway(
      {} as never,
      {} as never,
      {} as AuthAccountRepository,
      postAccess,
    );
    const client = {
      data: {},
      id: 'socket-1',
      join: jest.fn().mockResolvedValue(undefined),
    };

    const result = await gateway.handleSubscribe(client as never, {
      topic: 'post',
      postId: 'post-1',
    });

    expect(client.join).not.toHaveBeenCalled();
    expect(result.type).toBe('realtime.subscribe.denied');
  });
});
