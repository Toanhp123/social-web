import { MediaType, PostVisibility } from '@/generated/prisma/client.js';

export type CreatePostMediaInput = {
  url: string;
  thumbnailUrl?: string | null;
  mimeType?: string | null;
  size?: number | null;
  type: MediaType;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  order: number;
  alt?: string | null;
};

export type CreatePostInput = {
  authorId: string;
  content: string;
  visibility: PostVisibility;
  media: CreatePostMediaInput[];
};
