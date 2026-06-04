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
  size?: "sm" | "md";
  variant?: "compact" | "detailed";
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
};

export function Combobox({
  name,
  label,
  options,
  defaultValue,
  value,
  placeholder = "Chon mot muc",
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
  const triggerSizeClass =
    size === "sm" ? "min-h-10 px-3 py-2" : "min-h-12 px-4 py-3";
  const iconSizeClass = size === "sm" ? "size-7" : "size-8";
  const optionSizeClass = size === "sm" ? "px-3 py-2" : "px-3 py-3";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
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
      {label && <p className="mb-2 text-sm text-zinc-300">{label}</p>}
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
          "flex w-full items-center justify-between gap-3 rounded-xl",
          "border border-zinc-800 bg-zinc-950 text-left",
          "text-sm text-white shadow-sm transition outline-none",
          "hover:border-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "disabled:pointer-events-none disabled:opacity-60",
          triggerSizeClass,
        ].join(" ")}
      >
        <span className="flex min-w-0 items-center gap-3">
          {selectedOption?.icon && (
            <span
              className={[
                "grid shrink-0 place-items-center rounded-lg bg-zinc-900 text-blue-300",
                iconSizeClass,
              ].join(" ")}
            >
              {selectedOption.icon}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {selectedOption?.label ?? placeholder}
            </span>
            {showDetails && selectedOption?.description && (
              <span className="mt-0.5 block truncate text-xs text-zinc-500">
                {selectedOption.description}
              </span>
            )}
          </span>
        </span>
        <ChevronDown
          className={[
            "size-4 shrink-0 text-zinc-500 transition-transform",
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
            "absolute z-20 mt-2 w-full overflow-hidden rounded-xl",
            "border border-zinc-800 bg-zinc-950 p-1 shadow-2xl shadow-black/40",
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
                  "text-sm transition hover:bg-zinc-900",
                  optionSizeClass,
                  isSelected ? "bg-blue-500/10 text-white" : "text-zinc-300",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {option.icon && (
                  <span
                    className={[
                      "grid shrink-0 place-items-center rounded-lg bg-zinc-900 text-blue-300",
                      iconSizeClass,
                    ].join(" ")}
                  >
                    {option.icon}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {option.label}
                  </span>
                  {showDetails && option.description && (
                    <span className="mt-0.5 block truncate text-xs text-zinc-500">
                      {option.description}
                    </span>
                  )}
                </span>
                {isSelected && <Check className="size-4 text-blue-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
