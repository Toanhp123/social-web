import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';

type CanViewPostInput = {
  postId: string;
  viewerId?: string;
};

@Injectable()
export class PostAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async canViewPost(input: CanViewPostInput): Promise<boolean> {
    const post = await this.prisma.post.findFirst({
      where: {
        id: input.postId,
        deletedAt: null,
        isHidden: false,
        OR: [
          { visibility: 'PUBLIC' },
          ...(input.viewerId ? [{ authorId: input.viewerId }] : []),
        ],
      },
      select: {
        id: true,
      },
    });

    return Boolean(post);
  }
}
