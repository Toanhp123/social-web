import { RefreshCw } from "lucide-react";
import { useTranslations } from "@/shared/i18n";

type FeedHeaderProps = {
  isRefetching: boolean;
  onRefresh: () => void;
};

export function FeedHeader({ isRefetching, onRefresh }: FeedHeaderProps) {
  const t = useTranslations().feed;

  return (
    <div className="rounded-card border-surface-border bg-surface shadow-card flex items-center justify-between gap-3 border px-4 py-3">
      <div>
        <h2 id="feed-title" className="text-primary text-lg font-semibold">
          {t.latest}
        </h2>
        <p className="text-muted mt-1 text-sm">{t.latestDescription}</p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefetching}
        className="rounded-pill border-subtle bg-surface text-secondary shadow-control hover:border-brand-border hover:text-brand inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium disabled:opacity-60"
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
