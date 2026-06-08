import type { ReactNode } from "react";

type FeedNoticeProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function FeedNotice({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: FeedNoticeProps) {
  return (
    <div className="rounded-card border border-dashed border-subtle bg-surface p-6 shadow-card">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-primary">{title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            {description}
          </p>

          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 rounded-pill bg-brand px-4 py-2 text-sm font-medium text-inverse hover:bg-brand-hover"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
