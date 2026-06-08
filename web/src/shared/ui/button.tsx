import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "link";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-brand text-inverse hover:bg-brand-hover",
  secondary: "bg-surface-soft text-secondary hover:bg-surface-muted",
  ghost: "text-secondary hover:bg-surface-muted",
  link: "rounded-none px-0 py-0 text-muted hover:text-brand",
};

export function Button({
  variant = "primary",
  fullWidth = true,
  className,
  ...props
}: ButtonProps) {
  const isLink = variant === "link";

  return (
    <button
      {...props}
      className={cn(
        isLink
          ? "text-sm font-medium transition disabled:opacity-60"
          : "rounded-control px-4 py-2 text-sm font-medium transition disabled:opacity-60",
        fullWidth && !isLink && "w-full",
        variantClassName[variant],
        className,
      )}
    />
  );
}
