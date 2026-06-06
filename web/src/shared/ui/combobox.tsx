"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
};

type ComboboxProps = {
  name: string;
  label?: string;
  options: ComboboxOption[];
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  size?: "xs" | "sm" | "md";
  variant?: "compact" | "detailed";
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
};

const triggerSizeClass = {
  xs: "min-h-8 px-3 py-1.5",
  sm: "min-h-10 px-3 py-2",
  md: "min-h-12 px-4 py-3",
} satisfies Record<NonNullable<ComboboxProps["size"]>, string>;

const triggerMinWidthClass = {
  xs: "min-w-max",
  sm: "min-w-40",
  md: "min-w-48",
} satisfies Record<NonNullable<ComboboxProps["size"]>, string>;

const iconSizeClass = {
  xs: "size-5",
  sm: "size-7",
  md: "size-8",
} satisfies Record<NonNullable<ComboboxProps["size"]>, string>;

const optionSizeClass = {
  xs: "px-3 py-2",
  sm: "px-3 py-2",
  md: "px-3 py-3",
} satisfies Record<NonNullable<ComboboxProps["size"]>, string>;

const listboxWidthClass = {
  xs: "min-w-56",
  sm: "min-w-56",
  md: "min-w-64",
} satisfies Record<NonNullable<ComboboxProps["size"]>, string>;

export function Combobox({
  name,
  label,
  options,
  defaultValue,
  value,
  placeholder = "Chọn một mục",
  size = "sm",
  variant = "compact",
  disabled,
  className,
  onValueChange,
}: ComboboxProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const initialValue = defaultValue ?? options[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  const selectedValue = value ?? internalValue;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );

  const activeIndex = Math.max(
    options.findIndex((option) => option.value === selectedValue),
    0,
  );

  const showDetails = variant === "detailed";
  const isPill = size === "xs";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function selectValue(nextValue: string, close = true) {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setIsOpen(!close);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || options.length === 0) {
      return;
    }

    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      setIsOpen(true);
    }

    if (event.key === "ArrowDown") {
      selectValue(
        options[Math.min(activeIndex + 1, options.length - 1)].value,
        false,
      );
    }

    if (event.key === "ArrowUp") {
      selectValue(options[Math.max(activeIndex - 1, 0)].value, false);
    }

    if (event.key === "Home") {
      selectValue(options[0].value, false);
    }

    if (event.key === "End") {
      selectValue(options[options.length - 1].value, false);
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((current) => !current);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={["relative", className].filter(Boolean).join(" ")}
    >
      {label && (
        <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
      )}

      <input type="hidden" name={name} value={selectedValue} />

      <button
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={[
          "flex items-center justify-between text-left transition outline-none",
          "disabled:pointer-events-none disabled:opacity-60",
          triggerSizeClass[size],
          triggerMinWidthClass[size],
          isPill ? "w-fit max-w-full" : "w-full",
          isPill
            ? "gap-1.5 rounded-full border border-transparent bg-zinc-100 text-xs font-semibold text-zinc-700 shadow-none hover:bg-zinc-200 focus:ring-2 focus:ring-blue-500/20"
            : "gap-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-950 shadow-sm hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
        ].join(" ")}
      >
        <span
          className={[
            "flex min-w-0 flex-1 items-center",
            isPill ? "gap-1.5" : "gap-3",
          ].join(" ")}
        >
          {selectedOption?.icon && !isPill && (
            <span
              className={[
                "grid shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600",
                iconSizeClass[size],
              ].join(" ")}
            >
              {selectedOption.icon}
            </span>
          )}

          <span
            className={[
              "min-w-0 flex-1 leading-tight",
              isPill ? "whitespace-nowrap" : "",
            ].join(" ")}
          >
            <span
              className={[
                "block font-medium",
                isPill
                  ? "whitespace-nowrap"
                  : "wrap-break-word whitespace-normal",
              ].join(" ")}
            >
              {selectedOption?.label ?? placeholder}
            </span>

            {showDetails && selectedOption?.description && (
              <span className="mt-0.5 block text-xs wrap-break-word whitespace-normal text-zinc-500">
                {selectedOption.description}
              </span>
            )}
          </span>
        </span>

        <ChevronDown
          className={[
            "shrink-0 text-zinc-500 transition-transform",
            isPill ? "size-3.5" : "size-4",
            isOpen ? "rotate-180" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={[
            "absolute z-20 mt-2 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl",
            "border border-zinc-200 bg-white p-1 shadow-2xl shadow-zinc-200",
            listboxWidthClass[size],
          ].join(" ")}
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectValue(option.value)}
                className={[
                  "flex w-full items-center gap-3 rounded-lg text-left",
                  "text-sm transition hover:bg-zinc-50",
                  optionSizeClass[size],
                  isSelected ? "bg-blue-50 text-blue-700" : "text-zinc-700",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {option.icon && (
                  <span
                    className={[
                      "grid shrink-0 place-items-center rounded-lg bg-zinc-100 text-blue-600",
                      iconSizeClass[size],
                    ].join(" ")}
                  >
                    {option.icon}
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="block font-medium wrap-break-word whitespace-normal">
                    {option.label}
                  </span>

                  {showDetails && option.description && (
                    <span className="mt-0.5 block text-xs wrap-break-word whitespace-normal text-zinc-500">
                      {option.description}
                    </span>
                  )}
                </span>

                {isSelected && (
                  <Check className="size-4 shrink-0 text-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
