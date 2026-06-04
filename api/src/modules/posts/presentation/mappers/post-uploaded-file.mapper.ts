import { CreatePostMediaFile } from '@/modules/posts/application/services/create-post.service.js';

export type UploadedPostMediaFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
};

export class PostUploadedFileMapper {
  static toApplicationFiles(
    files: UploadedPostMediaFile[] | undefined,
  ): CreatePostMediaFile[] {
    return (files ?? []).map((file) => ({
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
    }));
  }
}
