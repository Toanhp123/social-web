import type { ComponentPropsWithoutRef } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type DateInputProps = Omit<ComponentPropsWithoutRef<"input">, "type">;

export function DateInput({ className, ...props }: DateInputProps) {
  return (
    <div
      className={cn(
        "border-subtle bg-surface-soft focus-within:border-brand focus-within:bg-surface rounded-control mt-2 flex h-11 w-full items-center gap-3 border px-4 transition",
        className,
      )}
    >
      <CalendarDays className="text-muted size-4 shrink-0" />
      <input
        {...props}
        type="date"
        className="text-primary h-full min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
