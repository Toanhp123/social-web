import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type InputSize = "sm" | "md" | "lg";
type InputVariant = "default" | "soft";

type InputProps = Omit<ComponentPropsWithoutRef<"input">, "size"> & {
  size?: InputSize;
  variant?: InputVariant;
};

const inputSizeClass = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-4 text-base",
} satisfies Record<InputSize, string>;

const inputVariantClass = {
  default: "border-subtle bg-surface-soft focus:border-brand focus:bg-surface",
  soft: "border-transparent bg-surface-muted focus:border-brand focus:bg-surface",
} satisfies Record<InputVariant, string>;

export function Input({
  size = "md",
  variant = "default",
  className,
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "rounded-control text-primary mt-2 w-full border outline-none",
        "placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-60",
        inputSizeClass[size],
        inputVariantClass[variant],
        className,
      )}
    />
  );
}
