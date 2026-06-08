import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import type { PostMedia } from "../model/types";

type PostMediaGridProps = {
  media: PostMedia[];
  onMediaClick?: () => void;
};

export function PostMediaGrid({ media, onMediaClick }: PostMediaGridProps) {
  if (media.length === 0) {
    return null;
  }

  const isClickable = Boolean(onMediaClick);

  return (
    <div
      className={cn(
        "grid gap-1 bg-surface-muted",
        media.length === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {media.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={onMediaClick}
          disabled={!isClickable}
          className={cn(
            "relative aspect-video overflow-hidden bg-surface-muted text-left",
            isClickable ? "cursor-zoom-in" : "cursor-default",
          )}
        >
          {item.type === "VIDEO" ? (
            <video
              src={item.url}
              className="size-full object-cover"
              controls={!isClickable}
              preload="metadata"
              muted={isClickable}
              playsInline
            />
          ) : (
            <Image
              src={item.url}
              alt={item.alt ?? ""}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </button>
      ))}
    </div>
  );
}
