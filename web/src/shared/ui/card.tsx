import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type CardVariant = "default" | "elevated" | "soft";
type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = ComponentPropsWithoutRef<"section"> & {
  variant?: CardVariant;
  padding?: CardPadding;
};

const cardVariantClass = {
  default: "border-surface-border bg-surface shadow-card border",
  elevated: "border-surface-border bg-surface-elevated shadow-card border",
  soft: "bg-surface-soft",
} satisfies Record<CardVariant, string>;

const cardPaddingClass = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
} satisfies Record<CardPadding, string>;

export function Card({
  variant = "default",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <section
      {...props}
      className={cn(
        "rounded-card",
        cardVariantClass[variant],
        cardPaddingClass[padding],
        className,
      )}
    />
  );
}
