import { Inject, Injectable } from '@nestjs/common';
import { POST_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';

export type GetPostReportStatusInput = {
  postId: string;
  reporterId: string;
};

export type GetPostReportStatusResult = {
  reported: boolean;
};

@Injectable()
export class GetPostReportStatusService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(
    input: GetPostReportStatusInput,
  ): Promise<GetPostReportStatusResult> {
    const reported = await this.postRepository.hasReportedPost(input);

    return { reported };
  }
}
