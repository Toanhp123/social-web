import type { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input">;

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={[
        "mt-2 w-full rounded-control border border-subtle",
        "bg-surface-soft px-4 py-3 text-primary outline-none",
        "placeholder:text-placeholder focus:border-brand focus:bg-surface",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
