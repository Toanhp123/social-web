import Image from "next/image";
import type { PostMedia } from "../model/types";

type PostMediaGridProps = {
  media: PostMedia[];
};

export function PostMediaGrid({ media }: PostMediaGridProps) {
  if (media.length === 0) {
    return null;
  }

  return (
    <div
      className={[
        "grid gap-1 bg-zinc-100",
        media.length === 1 ? "grid-cols-1" : "grid-cols-2",
      ].join(" ")}
    >
      {media.map((item) => (
        <div
          key={item.id}
          className="relative aspect-video overflow-hidden bg-zinc-200"
        >
          {item.type === "VIDEO" ? (
            <video
              src={item.url}
              className="size-full object-cover"
              controls
              preload="metadata"
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
        </div>
      ))}
    </div>
  );
}
