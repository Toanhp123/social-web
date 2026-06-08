import { RefreshCw } from "lucide-react";
import { useTranslations } from "@/shared/i18n";

type FeedHeaderProps = {
  isRefetching: boolean;
  onRefresh: () => void;
};

export function FeedHeader({ isRefetching, onRefresh }: FeedHeaderProps) {
  const t = useTranslations().feed;

  return (
    <div className="flex items-center justify-between gap-3 rounded-card border border-surface bg-surface px-4 py-3 shadow-card">
      <div>
        <h2 id="feed-title" className="text-lg font-semibold text-primary">
          {t.latest}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t.latestDescription}
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefetching}
        className="inline-flex items-center gap-2 rounded-pill border border-subtle bg-surface px-3 py-2 text-sm font-medium text-secondary shadow-sm hover:border-brand-soft hover:text-brand disabled:opacity-60"
      >
        <RefreshCw
          className={["size-4", isRefetching ? "animate-spin" : ""]
            .filter(Boolean)
            .join(" ")}
        />
        {t.refresh}
      </button>
    </div>
  );
}
