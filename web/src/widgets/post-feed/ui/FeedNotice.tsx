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
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 shadow-sm shadow-zinc-200/70">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-zinc-950">{title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
            {description}
          </p>

          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
