import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  FILE_STORAGE,
  POST_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { FileStoragePort } from '@/modules/media/application/ports/file-storage.port.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { CreatePostMediaInput } from '@/modules/posts/domain/types/create-post-input.type.js';
import { MediaType, PostVisibility } from '@/generated/prisma/client.js';

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

const MAX_POST_CONTENT_LENGTH = 5000;
const MAX_MEDIA_FILES = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

@Injectable()
export class CreatePostService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const content = input.content?.trim() ?? '';
    const files = input.files ?? [];

    this.assertValidInput(content, files);

    const media = await this.uploadMedia(input.authorId, files);

    return await this.postRepository.create({
      authorId: input.authorId,
      content,
      visibility: input.visibility ?? PostVisibility.PUBLIC,
      media,
    });
  }

  private assertValidInput(
    content: string,
    files: CreatePostMediaFile[],
  ): void {
    if (!content && files.length === 0) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Post content or media is required',
      );
    }

    if (content.length > MAX_POST_CONTENT_LENGTH) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Post content is too long',
        400,
        { maxLength: MAX_POST_CONTENT_LENGTH },
      );
    }

    if (files.length > MAX_MEDIA_FILES) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Too many media files',
        400,
        { maxFiles: MAX_MEDIA_FILES },
      );
    }

    files.forEach((file) => this.assertValidMediaFile(file));
  }

  private assertValidMediaFile(file: CreatePostMediaFile): void {
    const mediaKind = this.getMediaKind(file.mimetype);
    const maxBytes = mediaKind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

    if (file.size > maxBytes) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Media file is too large',
        400,
        { maxBytes, size: file.size, mimetype: file.mimetype },
      );
    }
  }

  private async uploadMedia(
    authorId: string,
    files: CreatePostMediaFile[],
  ): Promise<CreatePostMediaInput[]> {
    const uploadedMedia: CreatePostMediaInput[] = [];
    const postUploadId = randomUUID();

    for (const [index, file] of files.entries()) {
      const mediaKind = this.getMediaKind(file.mimetype);
      const upload = await this.fileStorage.upload({
        buffer: file.buffer,
        folder: 'posts',
        publicId: `${authorId}/${postUploadId}/${index}`,
        resourceType: mediaKind,
      });

      uploadedMedia.push({
        url: upload.secureUrl,
        mimeType: file.mimetype,
        size: upload.bytes || file.size,
        type: mediaKind === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
        width: upload.width,
        height: upload.height,
        duration: upload.duration,
        order: index,
      });
    }

    return uploadedMedia;
  }

  private getMediaKind(mimetype: string): 'image' | 'video' {
    if (IMAGE_MIME_TYPES.has(mimetype)) {
      return 'image';
    }

    if (VIDEO_MIME_TYPES.has(mimetype)) {
      return 'video';
    }

    throw new DomainError(
      ErrorCode.VALIDATION_ERROR,
      'Only image and video files are allowed',
      400,
      { mimetype },
    );
  }
}
