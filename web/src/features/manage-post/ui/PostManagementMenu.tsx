"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Flag, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import type { Post } from "@/entities/post";
import { useCurrentSession } from "@/entities/session";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Dialog } from "@/shared/ui";
import { useCancelReportPostMutation } from "../model/use-cancel-report-post-mutation";
import { usePostReportStatusQuery } from "../model/use-post-report-status-query";
import { useRemovePostMutation } from "../model/use-remove-post-mutation";
import { useReportPostMutation } from "../model/use-report-post-mutation";

type PostManagementMenuProps = {
  post: Post;
  canInteract?: boolean;
  onRequireAuth?: () => void;
  onRemoved?: () => void;
};

export function PostManagementMenu({
  post,
  canInteract = true,
  onRequireAuth,
  onRemoved,
}: PostManagementMenuProps) {
  const t = useTranslations().managePost;
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

  function handleRemovePost() {
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

  function handleOpenReportDialog() {
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

  function handleCancelReport() {
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

  function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("reason") ?? "").trim();

    reportPostMutation.mutate(
      { postId: post.id, reason },
      {
        onSuccess: () => setIsReportDialogOpen(false),
      },
    );
  }

  return (
    <>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          className="rounded-pill text-placeholder hover:bg-surface-muted hover:text-secondary grid size-9 shrink-0 place-items-center transition"
          aria-label={t.menu}
          onClick={() => setIsOpen((value) => !value)}
        >
          <MoreHorizontal className="size-5" />
        </button>

        {isOpen && (
          <div className="rounded-card border-surface-border bg-surface shadow-popover absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden border p-1">
            {isAuthor ? (
              <MenuButton
                icon={<Trash2 className="size-4" />}
                label={removePostMutation.isPending ? t.removing : t.remove}
                disabled={removePostMutation.isPending}
                danger
                onClick={handleRemovePost}
              />
            ) : (
              <>
                <MenuButton
                  icon={
                    cancelReportPostMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Flag className="size-4" />
                    )
                  }
                  label={
                    reportStatusQuery.isLoading
                      ? t.checkingReport
                      : hasReported
                        ? cancelReportPostMutation.isPending
                          ? t.cancelingReport
                          : t.cancelReport
                        : t.report
                  }
                  disabled={
                    reportStatusQuery.isLoading ||
                    cancelReportPostMutation.isPending
                  }
                  onClick={
                    hasReported ? handleCancelReport : handleOpenReportDialog
                  }
                />
                {cancelReportPostMutation.error instanceof Error && (
                  <p className="text-danger px-3 py-2 text-xs">
                    {cancelReportPostMutation.error.message}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        closeLabel={t.closeReport}
        contentClassName="max-w-md"
      >
        <form onSubmit={handleReportSubmit} className="p-4">
          <h2 className="text-primary pr-10 text-lg font-semibold">
            {t.reportTitle}
          </h2>
          <p className="text-muted mt-1 text-sm">{t.reportDescription}</p>

          <textarea
            name="reason"
            rows={4}
            maxLength={500}
            placeholder={t.reportPlaceholder}
            className="rounded-card border-surface-border bg-surface-soft text-primary focus:border-brand mt-4 w-full resize-none border px-3 py-3 text-sm outline-none"
          />

          {reportPostMutation.error instanceof Error && (
            <p className="text-danger mt-3 text-sm">
              {reportPostMutation.error.message}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReportDialogOpen(false)}
              className="rounded-control text-secondary hover:bg-surface-muted px-4 py-2 text-sm font-medium"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              disabled={reportPostMutation.isPending}
              className="rounded-control bg-brand text-inverse hover:bg-brand-hover inline-flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {reportPostMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {reportPostMutation.isPending ? t.reporting : t.submitReport}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

function MenuButton({
  icon,
  label,
  disabled,
  danger,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-control flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium transition disabled:opacity-60",
        danger
          ? "text-danger hover:bg-danger-soft"
          : "text-secondary hover:bg-surface-soft hover:text-primary",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
