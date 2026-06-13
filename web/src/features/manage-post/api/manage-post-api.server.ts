import { authApiFetch } from "@/entities/session/server";

export type PostReportStatusDto = {
  reported: boolean;
  alreadyReported: boolean;
};

export async function removePostApi(postId: string): Promise<void> {
  await authApiFetch<void>(`/posts/${postId}`, {
    method: "DELETE",
  });
}

export async function getPostReportStatusApi(
  postId: string,
): Promise<PostReportStatusDto> {
  return authApiFetch<PostReportStatusDto>(`/posts/${postId}/report-status`);
}

export async function reportPostApi(input: {
  postId: string;
  reason?: string | null;
}): Promise<PostReportStatusDto> {
  return authApiFetch<PostReportStatusDto>(`/posts/${input.postId}/reports`, {
    method: "POST",
    body: JSON.stringify({ reason: input.reason ?? undefined }),
  });
}

export async function cancelReportPostApi(
  postId: string,
): Promise<PostReportStatusDto> {
  return authApiFetch<PostReportStatusDto>(`/posts/${postId}/reports`, {
    method: "DELETE",
  });
}
