import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button">;

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        "w-full rounded-xl bg-blue-600 px-4 py-3",
        "font-medium text-white disabled:opacity-60",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
