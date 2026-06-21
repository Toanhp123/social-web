"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type SelectableOption<TValue extends string> = {
  value: TValue;
  label: string;
  meta?: string;
  icon?: ReactNode;
};

type SelectableOptionGroupProps<TValue extends string> = {
  options: Array<SelectableOption<TValue>>;
  selectedValues: TValue[];
  onToggle: (value: TValue) => void;
  variant?: "tile" | "row";
  columns?: 2 | 3;
  className?: string;
};

export function SelectableOptionGroup<TValue extends string>({
  options,
  selectedValues,
  onToggle,
  variant = "tile",
  columns = 2,
  className,
}: SelectableOptionGroupProps<TValue>) {
  const isRow = variant === "row";

  return (
    <div
      className={cn(
        isRow
          ? "space-y-2"
          : columns === 3
            ? "grid grid-cols-3 gap-2"
            : "grid grid-cols-2 gap-2",
        className,
      )}
    >
      {options.map((option) => (
        <SelectableOptionButton
          key={option.value}
          option={option}
          selected={selectedValues.includes(option.value)}
          variant={variant}
          onClick={() => onToggle(option.value)}
        />
      ))}
    </div>
  );
}

function SelectableOptionButton<TValue extends string>({
  option,
  selected,
  variant,
  onClick,
}: {
  option: SelectableOption<TValue>;
  selected: boolean;
  variant: "tile" | "row";
  onClick: () => void;
}) {
  if (variant === "row") {
    return (
      <button
        type="button"
        className="rounded-control border-subtle bg-surface-soft hover:bg-surface flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left transition"
        onClick={onClick}
      >
        <span className="flex min-w-0 items-center gap-3">
          {option.icon && (
            <span className="rounded-control bg-surface-muted text-secondary grid size-9 shrink-0 place-items-center">
              {option.icon}
            </span>
          )}

          <span className="min-w-0">
            <span className="text-secondary block truncate text-sm font-medium">
              {option.label}
            </span>
            {option.meta && (
              <span className="text-muted block truncate text-xs">
                {option.meta}
              </span>
            )}
          </span>
        </span>

        <Checkmark selected={selected} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "rounded-control flex min-h-14 items-center justify-center gap-2 border px-3 text-sm font-medium transition",
        selected
          ? "border-brand-border bg-brand-soft text-brand-strong"
          : "border-subtle bg-surface-soft text-secondary hover:border-brand hover:bg-surface",
      )}
      onClick={onClick}
    >
      {option.icon}
      <span>{option.label}</span>
      {option.meta && <span className="text-muted text-xs">{option.meta}</span>}
    </button>
  );
}

function Checkmark({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "rounded-pill grid size-6 shrink-0 place-items-center border transition",
        selected
          ? "border-brand bg-brand text-inverse"
          : "border-subtle bg-surface text-muted",
      )}
    >
      {selected && <Check className="size-3.5" />}
    </span>
  );
}
