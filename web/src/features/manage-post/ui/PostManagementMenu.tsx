"use client";

import type { ReactNode } from "react";
import { Flag, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import type { Post } from "@/entities/post";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Button, Dialog, Textarea } from "@/shared/ui";
import { usePostManagementMenuController } from "../model/use-post-management-menu-controller";

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
  const {
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
  } = usePostManagementMenuController({
    post,
    canInteract,
    onRequireAuth,
    onRemoved,
  });

  return (
    <>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          className="rounded-pill text-placeholder hover:bg-surface-muted hover:text-secondary grid size-9 shrink-0 place-items-center transition"
          aria-label={t.menu}
          onClick={toggleMenu}
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
                onClick={removePost}
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
                  onClick={hasReported ? cancelReport : openReportDialog}
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
        onClose={closeReportDialog}
        closeLabel={t.closeReport}
        contentClassName="max-w-md"
      >
        <form onSubmit={submitReport} className="p-4">
          <h2 className="text-primary pr-10 text-lg font-semibold">
            {t.reportTitle}
          </h2>
          <p className="text-muted mt-1 text-sm">{t.reportDescription}</p>

          <Textarea
            name="reason"
            rows={4}
            maxLength={500}
            placeholder={t.reportPlaceholder}
            className="mt-4 resize-none"
          />

          {reportPostMutation.error instanceof Error && (
            <p className="text-danger mt-3 text-sm">
              {reportPostMutation.error.message}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              fullWidth={false}
              onClick={closeReportDialog}
            >
              {t.cancel}
            </Button>

            <Button
              type="submit"
              size="sm"
              fullWidth={false}
              disabled={reportPostMutation.isPending}
            >
              {reportPostMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {reportPostMutation.isPending ? t.reporting : t.submitReport}
            </Button>
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
