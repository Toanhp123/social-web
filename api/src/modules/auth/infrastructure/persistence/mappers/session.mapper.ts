import { Prisma } from '@/generated/prisma/client.js';
import { Session } from '@/modules/auth/domain/entities/session.entity.js';

export const SESSION_SELECT = {
  id: true,
  authAccountId: true,
  refreshTokenHash: true,
  isRevoked: true,
  expiresAt: true,
  createdAt: true,
  lastUsedAt: true,
} as const;

type SessionPayload = Prisma.SessionGetPayload<{
  select: typeof SESSION_SELECT;
}>;

export class SessionMapper {
  static select = SESSION_SELECT;

  static toDomain(prismaSession: SessionPayload): Session {
    return new Session(
      prismaSession.id,
      prismaSession.authAccountId,
      prismaSession.refreshTokenHash,
      prismaSession.isRevoked,
      prismaSession.expiresAt,
      prismaSession.createdAt,
      prismaSession.lastUsedAt,
    );
  }
}
