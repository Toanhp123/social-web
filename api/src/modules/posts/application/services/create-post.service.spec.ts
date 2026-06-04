import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { FileStoragePort } from '@/modules/media/application/ports/file-storage.port.js';
import { PostAuthor } from '@/modules/posts/domain/entities/post-author.entity.js';
import { PostMedia } from '@/modules/posts/domain/entities/post-media.entity.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import type { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { CreatePostService } from '@/modules/posts/application/services/create-post.service.js';
import {
  MediaType,
  PostType,
  PostVisibility,
} from '@/generated/prisma/client.js';

describe('CreatePostService', () => {
  const post = new Post(
    'post-1',
    new PostAuthor('user-1', 'Example User', 'exampleuser', null),
    'Hello world',
    PostType.MEDIA,
    PostVisibility.PUBLIC,
    [
      new PostMedia(
        'media-1',
        'https://cdn.example.com/image.jpg',
        null,
        'image/jpeg',
        1024,
        MediaType.IMAGE,
        800,
        600,
        null,
        0,
        null,
      ),
    ],
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

  let postRepository: jest.Mocked<PostRepository>;
  let fileStorage: jest.Mocked<FileStoragePort>;
  let service: CreatePostService;

  beforeEach(() => {
    postRepository = {
      create: jest.fn().mockResolvedValue(post),
    };
    fileStorage = {
      upload: jest.fn().mockResolvedValue({
        publicId: 'posts/user-1/upload/0',
        secureUrl: 'https://cdn.example.com/image.jpg',
        resourceType: 'image',
        bytes: 1024,
        width: 800,
        height: 600,
      }),
      delete: jest.fn(),
    };
    service = new CreatePostService(postRepository, fileStorage);
  });

  it('requires text or media', async () => {
    await expect(
      service.execute({ authorId: 'user-1', content: '   ', files: [] }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.VALIDATION_ERROR,
    });
  });

  it('uploads media before creating the post', async () => {
    await expect(
      service.execute({
        authorId: 'user-1',
        content: ' Hello world ',
        files: [
          {
            buffer: Buffer.from('image'),
            mimetype: 'image/jpeg',
            size: 1024,
          },
        ],
      }),
    ).resolves.toBe(post);

    expect(fileStorage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        buffer: Buffer.from('image'),
        folder: 'posts',
        resourceType: 'image',
      }),
    );
    expect(postRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'user-1',
        content: 'Hello world',
        visibility: PostVisibility.PUBLIC,
        media: [
          expect.objectContaining({
            url: 'https://cdn.example.com/image.jpg',
            type: MediaType.IMAGE,
            order: 0,
          }),
        ],
      }),
    );
  });
});
