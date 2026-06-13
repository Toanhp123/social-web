import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-brand text-inverse hover:bg-brand-hover",
  secondary: "bg-surface-soft text-secondary hover:bg-surface-muted",
  ghost: "text-secondary hover:bg-surface-muted",
  link: "rounded-none px-0 py-0 text-muted hover:text-brand",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "size-10 p-0",
};

export function Button({
  variant = "primary",
  size = "md",
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
          : cn(
              "rounded-control font-medium transition disabled:opacity-60",
              sizeClassName[size],
            ),
        fullWidth && !isLink && "w-full",
        variantClassName[variant],
        className,
      )}
    />
  );
}
