"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type SegmentedTabItem<TValue extends string> = {
  value: TValue;
  label: string;
  icon?: ReactNode;
  count?: number;
};

type SegmentedTabsProps<TValue extends string> = {
  items: Array<SegmentedTabItem<TValue>>;
  value: TValue;
  onValueChange: (value: TValue) => void;
  ariaLabel: string;
  variant?: "underline" | "pill";
  size?: "sm" | "md";
  hideLabelBelowSm?: boolean;
  className?: string;
};

const sizeClass = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-3 text-sm sm:px-4",
} satisfies Record<NonNullable<SegmentedTabsProps<string>["size"]>, string>;

export function SegmentedTabs<TValue extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  variant = "underline",
  size = "md",
  hideLabelBelowSm = false,
  className,
}: SegmentedTabsProps<TValue>) {
  const isPill = variant === "pill";

  return (
    <nav
      className={cn(
        "flex gap-1 overflow-x-auto",
        isPill && "rounded-control bg-surface-soft p-1",
        className,
      )}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            className={cn(
              "rounded-control relative inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition",
              "focus-visible:ring-brand-ring focus-visible:ring-4 focus-visible:outline-none",
              sizeClass[size],
              isPill
                ? isActive
                  ? "bg-surface text-primary shadow-control"
                  : "text-secondary hover:text-primary"
                : cn(
                    "text-secondary hover:bg-surface-soft hover:text-primary",
                    isActive && "bg-brand-soft text-brand",
                  ),
            )}
          >
            {item.icon}
            <span className={cn(hideLabelBelowSm && "hidden sm:inline")}>
              {item.label}
            </span>
            {typeof item.count === "number" && (
              <span className="text-muted text-xs">{item.count}</span>
            )}
            {!isPill && isActive && (
              <span className="bg-brand rounded-pill absolute right-3 bottom-0 left-3 h-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
