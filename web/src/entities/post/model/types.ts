export type PostVisibility = "PUBLIC" | "FRIENDS_ONLY" | "PRIVATE";
export type PostType = "TEXT" | "MEDIA" | "SHARE" | "SYSTEM";
export type MediaType = "IMAGE" | "VIDEO";

export type PostAuthor = {
  id: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
};

export type PostMedia = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  size: number | null;
  type: MediaType;
  width: number | null;
  height: number | null;
  duration: number | null;
  order: number;
  alt: string | null;
};

export type Post = {
  id: string;
  content: string;
  type: PostType;
  visibility: PostVisibility;
  author: PostAuthor;
  media: PostMedia[];
  createdAt: string;
  updatedAt: string;
};
