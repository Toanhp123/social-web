import type { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input">;

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={[
        "mt-2 w-full rounded-xl border border-zinc-700",
        "bg-zinc-950 px-4 py-3 text-white outline-none",
        "focus:border-blue-500",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
