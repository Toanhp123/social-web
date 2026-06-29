import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type TextareaVariant = "default" | "composer";
type TextareaSize = "sm" | "md" | "lg";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  variant?: TextareaVariant;
  size?: TextareaSize;
};

const textareaVariantClass = {
  default: cn(
    "rounded-card border border-subtle bg-surface-soft",
    "text-primary",
    "focus:border-brand focus:bg-surface",
  ),
  composer: cn(
    "border-0 bg-transparent px-0 py-0",
    "text-2xl leading-9 text-primary",
    "placeholder:text-placeholder",
  ),
} satisfies Record<TextareaVariant, string>;

const textareaSizeClass = {
  sm: "min-h-9 px-3 py-2 text-sm",
  md: "min-h-10 px-3 py-2 text-sm",
  lg: "min-h-12 px-4 py-3 text-base",
} satisfies Record<TextareaSize, string>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { variant = "default", size = "md", className, ...props },
    ref,
  ) {
    const isComposer = variant === "composer";

    return (
      <textarea
        {...props}
        ref={ref}
        className={cn(
          "w-full resize-none outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          textareaVariantClass[variant],
          !isComposer && textareaSizeClass[size],
          className,
        )}
      />
    );
  },
);
