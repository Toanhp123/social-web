export type GroupPrivacy = "PUBLIC" | "PRIVATE";
export type GroupMemberRole = "OWNER" | "ADMIN" | "MEMBER";
export type GroupJoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type GroupViewer = {
  role: GroupMemberRole | null;
  joinRequestStatus: GroupJoinRequestStatus | null;
};

export type Group = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  privacy: GroupPrivacy;
  avatarUrl: string | null;
  coverUrl: string | null;
  memberCount: number;
  createdAt: string;
  viewer: GroupViewer;
};

export type GroupPage = {
  items: Group[];
  nextCursor: string | null;
};

export type JoinGroupResult = {
  status: "member" | "pending";
  group: Group;
};

export type GroupJoinRequest = {
  id: string;
  groupId: string;
  requesterId: string;
  status: GroupJoinRequestStatus;
  createdAt: string;
};
