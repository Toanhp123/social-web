import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type InputProps = ComponentPropsWithoutRef<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "rounded-control border-subtle mt-2 w-full border",
        "bg-surface-soft text-primary px-4 py-3 outline-none",
        "placeholder:text-placeholder focus:border-brand focus:bg-surface",
        className,
      )}
    />
  );
}
