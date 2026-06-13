import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

type PostActionProps = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function PostAction({
  icon,
  label,
  active,
  disabled,
  onClick,
}: PostActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-control px-2 text-sm font-medium transition sm:gap-2 sm:px-3",
        "disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "text-brand hover:bg-brand-soft"
          : "text-muted hover:bg-surface-soft hover:text-brand",
      )}
    >
      {icon}
      <span className="hidden min-w-0 truncate sm:inline">{label}</span>
    </button>
  );
}
