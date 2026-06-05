import type { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input">;

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={[
        "mt-2 w-full rounded-xl border border-zinc-200",
        "bg-zinc-50 px-4 py-3 text-zinc-950 outline-none",
        "placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
