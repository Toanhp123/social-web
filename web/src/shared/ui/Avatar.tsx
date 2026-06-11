import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/utils";

type AvatarProps = {
  src?: string | null;
  alt: string;
  name?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ src, alt, name, size = 40, className }: AvatarProps) {
  const fallbackInitial = getAvatarInitial(name ?? alt);
  const avatarStyle = {
    "--avatar-size": `${size}px`,
  } as CSSProperties;

  if (!src) {
    return (
      <span
        aria-label={alt}
        role="img"
        style={avatarStyle}
        className={cn(
          "bg-brand-soft text-brand-strong ring-brand/15 grid size-[var(--avatar-size)] shrink-0 place-items-center rounded-full text-sm font-semibold ring-1 select-none",
          className,
        )}
      >
        {fallbackInitial}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={avatarStyle}
      className={cn(
        "size-[var(--avatar-size)] shrink-0 rounded-full object-cover",
        className,
      )}
    />
  );
}

function getAvatarInitial(value: string): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "?";
  }

  return normalizedValue.slice(0, 1).toUpperCase();
}
