import {
  GroupJoinRequestStatus,
  GroupMemberRole,
  GroupPrivacy,
} from '@/generated/prisma/client.js';

export type GroupViewerState = {
  role: GroupMemberRole | null;
  joinRequestStatus: GroupJoinRequestStatus | null;
};

export class Group {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly privacy: GroupPrivacy,
    public readonly avatarUrl: string | null,
    public readonly coverUrl: string | null,
    public readonly memberCount: number,
    public readonly createdAt: Date,
    public readonly viewer: GroupViewerState = {
      role: null,
      joinRequestStatus: null,
    },
  ) {}

  get isPrivate(): boolean {
    return this.privacy === GroupPrivacy.PRIVATE;
  }

  canBeViewedBy(viewerId?: string | null): boolean {
    return (
      !this.isPrivate || this.ownerId === viewerId || Boolean(this.viewer.role)
    );
  }
}
