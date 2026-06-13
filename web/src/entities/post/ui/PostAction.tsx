import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

type PostActionProps = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  density?: "compact" | "comfortable";
  onClick?: () => void;
};

export function PostAction({
  icon,
  label,
  active,
  disabled,
  density = "comfortable",
  onClick,
}: PostActionProps) {
  const isCompact = density === "compact";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-10 w-full min-w-0 items-center justify-center rounded-control text-sm font-medium transition",
        isCompact ? "gap-1.5 px-2" : "gap-2 px-3",
        "disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "text-brand hover:bg-brand-soft"
          : "text-muted hover:bg-surface-soft hover:text-brand",
      )}
    >
      {icon}
      {!isCompact && <span className="min-w-0 truncate">{label}</span>}
    </button>
  );
}
