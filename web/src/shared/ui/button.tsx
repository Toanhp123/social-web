import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const buttonVariantClass = {
  primary: "bg-brand text-inverse hover:bg-brand-hover",
  secondary: "bg-surface-soft text-secondary hover:bg-surface-muted",
  ghost: "text-secondary hover:bg-surface-muted",
  danger: "border border-danger-border text-danger hover:bg-danger-soft",
  link: "rounded-none px-0 py-0 text-muted hover:text-brand",
} satisfies Record<ButtonVariant, string>;

const buttonSizeClass = {
  xs: "h-8 px-2.5 text-xs",
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "size-10 p-0",
} satisfies Record<ButtonSize, string>;

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
              buttonSizeClass[size],
            ),
        fullWidth && !isLink && "w-full",
        buttonVariantClass[variant],
        className,
      )}
    />
  );
}
