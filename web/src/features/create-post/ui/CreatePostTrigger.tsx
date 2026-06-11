"use client";

import { useTranslations } from "@/shared/i18n";

type CreatePostTriggerProps = {
  isOpen: boolean;
  onOpen: () => void;
};

export function CreatePostTrigger({ isOpen, onOpen }: CreatePostTriggerProps) {
  const t = useTranslations().createPost;

  return (
    <section className="rounded-card border-surface-border bg-surface shadow-card border p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-pill bg-brand-gradient text-inverse grid size-11 shrink-0 place-items-center text-sm font-semibold">
          SW
        </div>

        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="rounded-pill bg-surface-muted text-muted hover:bg-surface-muted min-h-11 flex-1 px-4 text-left text-sm transition"
        >
          {t.trigger}
        </button>
      </div>
    </section>
  );
}
