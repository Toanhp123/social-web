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
      className={[
        "flex w-full min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "text-blue-600 hover:bg-blue-50"
          : "text-zinc-500 hover:bg-zinc-50 hover:text-blue-600",
      ].join(" ")}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
