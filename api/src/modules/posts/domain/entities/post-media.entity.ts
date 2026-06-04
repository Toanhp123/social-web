import { MediaType } from '@/generated/prisma/client.js';

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
}
