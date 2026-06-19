import type { RealtimeNotification } from "./realtime-event";

export function toRealtimeNotification(
  data: unknown,
): RealtimeNotification | null {
  if (!data || typeof data !== "object") return null;

  const n = data as Record<string, unknown>;

  if (typeof n.id !== "string") return null;
  if (typeof n.userId !== "string") return null;
  if (typeof n.notificationType !== "string") return null;

  const actorId =
    typeof n.actorId === "string" || n.actorId === null ? n.actorId : null;
  const refId =
    typeof n.refId === "string" || n.refId === null ? n.refId : null;

  return {
    id: n.id,
    userId: n.userId,
    actorId,
    type: n.notificationType as RealtimeNotification["type"],
    refId,
    count: typeof n.count === "number" ? n.count : 1,
    readAt: typeof n.readAt === "string" ? n.readAt : null,
    createdAt:
      typeof n.createdAt === "string" ? n.createdAt : new Date().toISOString(),
  };
}
