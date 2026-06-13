import { Inject, Injectable } from '@nestjs/common';
import { POST_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';

export type ReportPostInput = {
  postId: string;
  reporterId: string;
  reason?: string | null;
};

export type ReportPostResult = {
  alreadyReported: boolean;
};

@Injectable()
export class ReportPostService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    private readonly createNotificationService: CreateNotificationService,
  ) {}

  async execute(input: ReportPostInput): Promise<ReportPostResult> {
    const authorId = await this.postRepository.findAuthorId(input.postId);

    if (!authorId) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Post not found',
        404,
      );
    }

    if (authorId === input.reporterId) {
      throw new DomainError(
        ErrorCode.OPERATION_NOT_ALLOWED,
        'You cannot report your own post',
        403,
      );
    }

    const alreadyReported = await this.postRepository.hasReportedPost({
      postId: input.postId,
      reporterId: input.reporterId,
    });

    if (alreadyReported) {
      return { alreadyReported: true };
    }

    await this.postRepository.report({
      postId: input.postId,
      reporterId: input.reporterId,
      reason: input.reason?.trim() || null,
    });
    await this.notifyReportSubmitted({
      postId: input.postId,
      authorId,
      reporterId: input.reporterId,
    });

    return { alreadyReported: false };
  }

  private async notifyReportSubmitted(input: {
    postId: string;
    authorId: string;
    reporterId: string;
  }): Promise<void> {
    await this.createNotificationService.execute({
      userId: input.authorId,
      actorId: null,
      type: 'POST_REPORT_SUBMITTED',
      refId: input.postId,
      aggregateKey: `post-report-submitted:author:${input.postId}`,
      message: 'Your post received a report.',
    });

    await this.createNotificationService.execute({
      userId: input.reporterId,
      actorId: null,
      type: 'POST_REPORT_SUBMITTED',
      refId: input.postId,
      aggregateKey: `post-report-submitted:reporter:${input.postId}`,
      message: 'You reported this post.',
    });
  }
}
