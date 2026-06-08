import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type TextareaVariant = "default" | "composer";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  variant?: TextareaVariant;
};

const variantClassName: Record<TextareaVariant, string> = {
  default: cn(
    "min-h-10 rounded-card border border-subtle bg-surface-soft px-3 py-2",
    "text-sm text-primary",
    "focus:border-brand focus:bg-surface",
  ),
  composer: cn(
    "border-0 bg-transparent px-0 py-0",
    "text-2xl leading-9 text-primary",
    "placeholder:text-placeholder",
  ),
};

export function Textarea({
  variant = "default",
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full resize-none outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClassName[variant],
        className,
      )}
    />
  );
}
