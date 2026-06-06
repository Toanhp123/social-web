type PostSkeletonProps = {
  compact?: boolean;
};

export function PostSkeleton({ compact }: PostSkeletonProps) {
  return (
    <div className="rounded-2xl border border-white bg-white p-4 opacity-80 shadow-sm shadow-zinc-200/70">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-zinc-100" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded-full bg-zinc-100" />
          <div className="h-2.5 w-20 rounded-full bg-zinc-100" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="h-3 w-full rounded-full bg-zinc-100" />
        <div className="h-3 w-10/12 rounded-full bg-zinc-100" />
        {!compact && <div className="h-3 w-7/12 rounded-full bg-zinc-100" />}
      </div>

      {!compact && <div className="mt-4 aspect-video rounded-xl bg-zinc-100" />}
    </div>
  );
}
