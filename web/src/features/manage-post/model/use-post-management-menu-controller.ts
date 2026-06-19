"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { Post } from "@/entities/post";
import { useCurrentSession } from "@/entities/session";
import { useCancelReportPostMutation } from "./use-cancel-report-post-mutation";
import { usePostReportStatusQuery } from "./use-post-report-status-query";
import { useRemovePostMutation } from "./use-remove-post-mutation";
import { useReportPostMutation } from "./use-report-post-mutation";

type UsePostManagementMenuControllerInput = {
  post: Post;
  canInteract: boolean;
  onRequireAuth?: () => void;
  onRemoved?: () => void;
};

export function usePostManagementMenuController({
  post,
  canInteract,
  onRequireAuth,
  onRemoved,
}: UsePostManagementMenuControllerInput) {
  const { currentUser } = useCurrentSession();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const removePostMutation = useRemovePostMutation();
  const reportPostMutation = useReportPostMutation();
  const cancelReportPostMutation = useCancelReportPostMutation();
  const isAuthor = currentUser?.id === post.author.id;
  const reportStatusQuery = usePostReportStatusQuery({
    postId: post.id,
    enabled: isOpen && canInteract && Boolean(currentUser) && !isAuthor,
  });
  const hasReported = reportStatusQuery.data?.reported ?? false;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function toggleMenu() {
    setIsOpen((value) => !value);
  }

  function closeReportDialog() {
    setIsReportDialogOpen(false);
  }

  function removePost() {
    setIsOpen(false);

    if (!canInteract) {
      onRequireAuth?.();
      return;
    }

    removePostMutation.mutate(
      { postId: post.id },
      {
        onSuccess: onRemoved,
      },
    );
  }

  function openReportDialog() {
    setIsOpen(false);

    if (!canInteract) {
      onRequireAuth?.();
      return;
    }

    if (hasReported) {
      return;
    }

    setIsReportDialogOpen(true);
  }

  function cancelReport() {
    if (!canInteract) {
      setIsOpen(false);
      onRequireAuth?.();
      return;
    }

    cancelReportPostMutation.mutate(
      { postId: post.id },
      {
        onSuccess: () => setIsOpen(false),
      },
    );
  }

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("reason") ?? "").trim();

    reportPostMutation.mutate(
      { postId: post.id, reason },
      {
        onSuccess: closeReportDialog,
      },
    );
  }

  return {
    rootRef,
    isOpen,
    isReportDialogOpen,
    isAuthor,
    hasReported,
    reportStatusQuery,
    removePostMutation,
    reportPostMutation,
    cancelReportPostMutation,
    toggleMenu,
    closeReportDialog,
    removePost,
    openReportDialog,
    cancelReport,
    submitReport,
  };
}
