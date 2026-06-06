import { PostVisibility } from '@/generated/prisma/client.js';

export type SharePostInput = {
  authorId: string;
  originalPostId: string;
  content?: string | null;
  visibility?: PostVisibility;
};
