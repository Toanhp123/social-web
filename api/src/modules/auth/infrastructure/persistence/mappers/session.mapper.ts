import { Prisma } from '../../../../../generated/prisma/client.js';
import { Session } from '../../../domain/entities/session.entity.js';

type SessionPayload = Prisma.SessionGetPayload<{
  select: {
    id: true;
    authAccountId: true;
    refreshTokenHash: true;
    isRevoked: true;
    expiresAt: true;
    createdAt: true;
    lastUsedAt: true;
  };
}>;

export class SessionMapper {
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
