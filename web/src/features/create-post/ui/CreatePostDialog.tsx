"use client";

import type { FormEvent } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { SendHorizontal, X } from "lucide-react";
import { Button, Combobox, MediaPicker } from "@/shared/ui";
import { VISIBILITY_OPTIONS } from "./VisibilityOptions";

type CreatePostDialogProps = {
  open: boolean;
  formKey: number;
  isSubmitting: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreatePostDialog({
  open,
  formKey,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: CreatePostDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-9999 flex min-h-dvh items-center justify-center bg-zinc-950/60 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="max-h-[min(760px,calc(100dvh-48px))] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-zinc-950/20"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="size-9" />

          <h2
            id="create-post-title"
            className="text-center text-lg font-semibold text-zinc-950"
          >
            Tao bai viet
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Dong"
            className="grid size-9 place-items-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          key={formKey}
          onSubmit={onSubmit}
          className="max-h-[calc(100dvh-140px)] overflow-y-auto p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-600 to-emerald-500 text-sm font-semibold text-white">
              SW
            </div>

            <div className="min-w-0">
              <p className="font-medium text-zinc-950">Social Web</p>
              <div className="mt-1 w-44">
                <Combobox
                  name="visibility"
                  label="Hien thi"
                  defaultValue="PUBLIC"
                  size="md"
                  variant="detailed"
                  options={VISIBILITY_OPTIONS}
                />
              </div>
            </div>
          </div>

          <textarea
            name="content"
            rows={6}
            maxLength={5000}
            autoFocus
            placeholder="Ban dang nghi gi?"
            className="min-h-40 w-full resize-none border-0 bg-white text-xl leading-8 text-zinc-950 outline-none placeholder:text-zinc-400"
          />

          <div className="mt-4 rounded-2xl border border-zinc-200 p-3">
            <MediaPicker name="media" label="Them anh/video" maxFiles={10} />
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="mt-5 border-t border-zinc-100 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3"
            >
              <SendHorizontal className="size-4" />
              {isSubmitting ? "Dang dang..." : "Dang bai"}
            </Button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
