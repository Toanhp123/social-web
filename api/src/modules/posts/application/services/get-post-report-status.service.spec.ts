import { jest } from '@jest/globals';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { GetPostReportStatusService } from './get-post-report-status.service.js';

describe(GetPostReportStatusService.name, () => {
  it('returns whether the viewer already reported the post', async () => {
    const postRepository = {
      hasReportedPost: jest.fn().mockResolvedValue(true),
    } as unknown as PostRepository;
    const service = new GetPostReportStatusService(postRepository);

    await expect(
      service.execute({
        postId: 'post-1',
        reporterId: 'viewer-1',
      }),
    ).resolves.toEqual({
      reported: true,
    });

    expect(postRepository.hasReportedPost).toHaveBeenCalledWith({
      postId: 'post-1',
      reporterId: 'viewer-1',
    });
  });
});
