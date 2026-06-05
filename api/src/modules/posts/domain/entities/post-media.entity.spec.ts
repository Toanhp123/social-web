import { describe, expect, it } from '@jest/globals';
import { MediaType } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { PostMedia } from '@/modules/posts/domain/entities/post-media.entity.js';

describe('PostMedia', () => {
  it('creates image media input from an upload result', () => {
    const media = PostMedia.createInputFromUpload({
      file: { mimetype: 'image/webp', size: 1024 },
      upload: {
        secureUrl: 'https://cdn.example.com/post.webp',
        bytes: 2048,
        width: 1200,
        height: 800,
      },
      order: 1,
    });

    expect(media).toEqual({
      url: 'https://cdn.example.com/post.webp',
      mimeType: 'image/webp',
      size: 2048,
      type: MediaType.IMAGE,
      width: 1200,
      height: 800,
      duration: undefined,
      order: 1,
    });
  });

  it('creates video media input from an upload result', () => {
    const media = PostMedia.createInputFromUpload({
      file: { mimetype: 'video/mp4', size: 1024 },
      upload: {
        secureUrl: 'https://cdn.example.com/post.mp4',
        bytes: 0,
        duration: 12.5,
      },
      order: 0,
    });

    expect(media).toMatchObject({
      url: 'https://cdn.example.com/post.mp4',
      mimeType: 'video/mp4',
      size: 1024,
      type: MediaType.VIDEO,
      duration: 12.5,
      order: 0,
    });
  });

  it('rejects unsupported media mime types', () => {
    expect(() =>
      PostMedia.assertValidUploadFile({ mimetype: 'application/pdf', size: 1 }),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.VALIDATION_ERROR,
      }),
    );
  });

  it('rejects media files that exceed kind-specific size limits', () => {
    expect(() =>
      PostMedia.assertValidUploadFile({
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024 + 1,
      }),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.VALIDATION_ERROR,
      }),
    );
  });
});
