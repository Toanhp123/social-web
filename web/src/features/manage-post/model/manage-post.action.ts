"use server";

import { ApiError } from "@/shared/api/api-error";
import {
  cancelReportPostApi,
  getPostReportStatusApi,
  removePostApi,
  reportPostApi,
  type PostReportStatusDto,
} from "../api/manage-post-api.server";
import { removePostSchema, reportPostSchema } from "./manage-post.schema";

export type ManagePostActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type ReportPostActionResult =
  | { ok: true; reportStatus: PostReportStatusDto }
  | { ok: false; error: string };

export type CancelReportPostActionResult =
  | { ok: true; reportStatus: PostReportStatusDto }
  | { ok: false; error: string };

export type GetPostReportStatusActionResult =
  | { ok: true; reportStatus: PostReportStatusDto }
  | { ok: false; error: string };

export async function removePostAction(input: {
  postId: string;
}): Promise<ManagePostActionResult> {
  const parsedInput = removePostSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    await removePostApi(parsedInput.data.postId);

    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function reportPostAction(input: {
  postId: string;
  reason?: string;
}): Promise<ReportPostActionResult> {
  const parsedInput = reportPostSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    const reportStatus = await reportPostApi(parsedInput.data);

    return { ok: true, reportStatus };
  } catch (error) {
    return toActionError(error);
  }
}

export async function cancelReportPostAction(input: {
  postId: string;
}): Promise<CancelReportPostActionResult> {
  const parsedInput = removePostSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    const reportStatus = await cancelReportPostApi(parsedInput.data.postId);

    return { ok: true, reportStatus };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getPostReportStatusAction(input: {
  postId: string;
}): Promise<GetPostReportStatusActionResult> {
  const parsedInput = removePostSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    const reportStatus = await getPostReportStatusApi(parsedInput.data.postId);

    return { ok: true, reportStatus };
  } catch (error) {
    return toActionError(error);
  }
}

function toActionError(error: unknown): { ok: false; error: string } {
  if (error instanceof ApiError) {
    return { ok: false, error: error.message };
  }

  return { ok: false, error: "Da co loi xay ra." };
}
