type PostSkeletonProps = {
  compact?: boolean;
  density?: "compact" | "comfortable";
};

export function PostSkeleton({
  compact,
  density = "comfortable",
}: PostSkeletonProps) {
  return (
    <div
      className={[
        "rounded-card border-surface-border bg-surface shadow-card border opacity-80",
        density === "compact" ? "p-3" : "p-4",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-pill bg-surface-muted size-10" />
        <div className="space-y-2">
          <div className="rounded-pill bg-surface-muted h-3 w-32" />
          <div className="rounded-pill bg-surface-muted h-2.5 w-20" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="rounded-pill bg-surface-muted h-3 w-full" />
        <div className="rounded-pill bg-surface-muted h-3 w-10/12" />
        {!compact && (
          <div className="rounded-pill bg-surface-muted h-3 w-7/12" />
        )}
      </div>

      {!compact && (
        <div className="rounded-control bg-surface-muted mt-4 aspect-video" />
      )}
    </div>
  );
}
