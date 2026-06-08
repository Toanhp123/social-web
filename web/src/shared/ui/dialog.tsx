"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  bodyScrollable?: boolean;
};

export function Dialog({
  open,
  onClose,
  children,
  closeLabel,
  className,
  contentClassName,
  bodyClassName,
  bodyScrollable = true,
}: DialogProps) {
  const t = useTranslations().shared;
  const resolvedCloseLabel = closeLabel ?? t.close;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-3 sm:p-6",
        className,
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "rounded-card bg-surface shadow-popover relative flex w-full max-w-2xl flex-col overflow-hidden",
          "max-h-[calc(100dvh-2.5rem)]",
          "sm:max-h-[min(86dvh,760px)]",
          contentClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label={resolvedCloseLabel}
          onClick={onClose}
          className="rounded-pill bg-surface-muted text-secondary hover:bg-surface-muted absolute top-3 right-3 z-20 flex size-9 items-center justify-center"
        >
          <X className="size-5" />
        </button>

        <div
          className={cn(
            "min-h-0 flex-1",
            bodyScrollable
              ? "scrollbar-none overflow-y-auto [&::-webkit-scrollbar]:hidden"
              : "flex flex-col overflow-hidden",
            bodyClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
