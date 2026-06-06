import { RefreshCw } from "lucide-react";

type FeedHeaderProps = {
  isRefetching: boolean;
  onRefresh: () => void;
};

export function FeedHeader({ isRefetching, onRefresh }: FeedHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm shadow-zinc-200/70">
      <div>
        <h2 id="feed-title" className="text-lg font-semibold text-zinc-950">
          Moi nhat
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Bai viet moi tu cong dong se xuat hien tai day.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefetching}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 shadow-sm hover:border-blue-200 hover:text-blue-600 disabled:opacity-60"
      >
        <RefreshCw
          className={["size-4", isRefetching ? "animate-spin" : ""]
            .filter(Boolean)
            .join(" ")}
        />
        Lam moi
      </button>
    </div>
  );
}
