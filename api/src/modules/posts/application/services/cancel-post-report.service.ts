import { Inject, Injectable } from '@nestjs/common';
import { POST_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';

export type CancelPostReportInput = {
  postId: string;
  reporterId: string;
};

export type CancelPostReportResult = {
  canceled: boolean;
};

@Injectable()
export class CancelPostReportService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    private readonly createNotificationService: CreateNotificationService,
  ) {}

  async execute(input: CancelPostReportInput): Promise<CancelPostReportResult> {
    const authorId = await this.postRepository.findAuthorId(input.postId);

    if (!authorId) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Post not found',
        404,
      );
    }

    const canceled = await this.postRepository.cancelReport(input);

    if (!canceled) {
      return { canceled: false };
    }

    await this.notifyReportCanceled({
      postId: input.postId,
      authorId,
      reporterId: input.reporterId,
    });

    return { canceled: true };
  }

  private async notifyReportCanceled(input: {
    postId: string;
    authorId: string;
    reporterId: string;
  }): Promise<void> {
    await this.createNotificationService.execute({
      userId: input.authorId,
      actorId: null,
      type: 'POST_REPORT_CANCELED',
      refId: input.postId,
      aggregateKey: `post-report-canceled:author:${input.postId}`,
      message: 'A report on your post was canceled.',
    });

    await this.createNotificationService.execute({
      userId: input.reporterId,
      actorId: null,
      type: 'POST_REPORT_CANCELED',
      refId: input.postId,
      aggregateKey: `post-report-canceled:reporter:${input.postId}`,
      message: 'You canceled your report on this post.',
    });
  }
}
