import type { ComponentPropsWithoutRef } from "react";

type TextareaVariant = "default" | "composer";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  variant?: TextareaVariant;
};

const variantClassName: Record<TextareaVariant, string> = {
  default: [
    "min-h-10 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2",
    "text-sm text-zinc-900",
    "focus:border-blue-300 focus:bg-white",
  ].join(" "),
  composer: [
    "border-0 bg-transparent px-0 py-0",
    "text-2xl leading-9 text-zinc-950",
    "placeholder:text-zinc-400",
  ].join(" "),
};

export function Textarea({
  variant = "default",
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      className={[
        "w-full resize-none outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClassName[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
