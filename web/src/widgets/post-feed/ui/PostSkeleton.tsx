type PostSkeletonProps = {
  compact?: boolean;
};

export function PostSkeleton({ compact }: PostSkeletonProps) {
  return (
    <div className="rounded-card border border-surface bg-surface p-4 opacity-80 shadow-card">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-pill bg-surface-muted" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded-pill bg-surface-muted" />
          <div className="h-2.5 w-20 rounded-pill bg-surface-muted" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="h-3 w-full rounded-pill bg-surface-muted" />
        <div className="h-3 w-10/12 rounded-pill bg-surface-muted" />
        {!compact && <div className="h-3 w-7/12 rounded-pill bg-surface-muted" />}
      </div>

      {!compact && <div className="mt-4 aspect-video rounded-control bg-surface-muted" />}
    </div>
  );
}
