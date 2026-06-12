import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  FILE_STORAGE,
  POST_FEED_JOB_QUEUE,
  POST_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { FileStoragePort } from '@/modules/media/application/ports/file-storage.port.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import { NotifyMentionedUsersService } from '@/modules/notifications/application/services/notify-mentioned-users.service.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { PostDraft } from '@/modules/posts/domain/entities/post-draft.entity.js';
import {
  PostMedia,
  POST_MEDIA_LIMITS,
} from '@/modules/posts/domain/entities/post-media.entity.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { CreatePostMediaInput } from '@/modules/posts/domain/types/create-post-input.type.js';
import { PostVisibility } from '@/generated/prisma/client.js';

export type CreatePostMediaFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
};

export type CreatePostInput = {
  authorId: string;
  content?: string | null;
  visibility?: PostVisibility;
  files?: CreatePostMediaFile[];
};

@Injectable()
export class CreatePostService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStoragePort,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,

    private readonly realtimePublisher: RealtimePublisher,

    private readonly notifyMentionedUsersService: NotifyMentionedUsersService,
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const files = input.files ?? [];

    this.assertValidUploadFiles(files);

    const media = await this.uploadMedia(input.authorId, files);
    const draft = PostDraft.create({
      authorId: input.authorId,
      content: input.content,
      visibility: input.visibility,
      media,
    });

    const post = await this.postRepository.create(draft.toCreateInput());

    await this.enqueuePostFeedFanOut(post.id, input.authorId);
    this.realtimePublisher.publishPostCreatedForAuthor({
      postId: post.id,
      authorId: post.author.id,
      visibility: post.visibility,
    });
    await this.notifyMentionedUsers(post);

    return post;
  }

  private async notifyMentionedUsers(post: Post): Promise<void> {
    await this.notifyMentionedUsersService.execute({
      actorId: post.author.id,
      content: post.content,
      refId: post.id,
      source: 'post',
    });
  }

  private async enqueuePostFeedFanOut(
    postId: string,
    authorId: string,
  ): Promise<void> {
    try {
      await this.postFeedJobQueue.enqueueFanOutPage({ postId, authorId });
    } catch {
      return;
    }
  }

  private assertValidUploadFiles(files: CreatePostMediaFile[]): void {
    if (files.length > POST_MEDIA_LIMITS.maxFiles) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Too many media files',
        400,
        { maxFiles: POST_MEDIA_LIMITS.maxFiles },
      );
    }

    files.forEach((file) => PostMedia.assertValidUploadFile(file));
  }

  private async uploadMedia(
    authorId: string,
    files: CreatePostMediaFile[],
  ): Promise<CreatePostMediaInput[]> {
    const uploadedMedia: CreatePostMediaInput[] = [];
    const postUploadId = randomUUID();

    for (const [index, file] of files.entries()) {
      const mediaKind = PostMedia.getUploadResourceType(file.mimetype);
      const upload = await this.fileStorage.upload({
        buffer: file.buffer,
        folder: 'posts',
        publicId: `${authorId}/${postUploadId}/${index}`,
        resourceType: mediaKind,
      });

      uploadedMedia.push(
        PostMedia.createInputFromUpload({ file, upload, order: index }),
      );
    }

    return uploadedMedia;
  }
}
