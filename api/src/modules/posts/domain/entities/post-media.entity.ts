import { MediaType } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { CreatePostMediaInput } from '@/modules/posts/domain/types/create-post-input.type.js';

export type PostMediaUploadFile = {
  mimetype: string;
  size: number;
};

export type PostMediaUploadedFile = {
  secureUrl: string;
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

export const POST_MEDIA_LIMITS = {
  maxFiles: 10,
  imageMaxBytes: 10 * 1024 * 1024,
  videoMaxBytes: 100 * 1024 * 1024,
  imageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  videoMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;

const IMAGE_MIME_TYPES = new Set<string>(POST_MEDIA_LIMITS.imageMimeTypes);
const VIDEO_MIME_TYPES = new Set<string>(POST_MEDIA_LIMITS.videoMimeTypes);

type PostMediaResourceType = 'image' | 'video';

export class PostMedia {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly thumbnailUrl: string | null,
    public readonly mimeType: string | null,
    public readonly size: number | null,
    public readonly type: MediaType,
    public readonly width: number | null,
    public readonly height: number | null,
    public readonly duration: number | null,
    public readonly order: number,
    public readonly alt: string | null,
  ) {}

  static assertValidUploadFile(file: PostMediaUploadFile): void {
    const mediaKind = this.getUploadResourceType(file.mimetype);
    const maxBytes =
      mediaKind === 'image'
        ? POST_MEDIA_LIMITS.imageMaxBytes
        : POST_MEDIA_LIMITS.videoMaxBytes;

    if (file.size > maxBytes) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Media file is too large',
        400,
        { maxBytes, size: file.size, mimetype: file.mimetype },
      );
    }
  }

  static createInputFromUpload(input: {
    file: PostMediaUploadFile;
    upload: PostMediaUploadedFile;
    order: number;
  }): CreatePostMediaInput {
    const mediaKind = this.getUploadResourceType(input.file.mimetype);

    return {
      url: input.upload.secureUrl,
      mimeType: input.file.mimetype,
      size: input.upload.bytes || input.file.size,
      type: mediaKind === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
      width: input.upload.width,
      height: input.upload.height,
      duration: input.upload.duration,
      order: input.order,
    };
  }

  static getUploadResourceType(mimetype: string): PostMediaResourceType {
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
