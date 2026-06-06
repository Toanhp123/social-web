import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "link";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500",
  secondary: "bg-zinc-50 text-zinc-600 hover:bg-zinc-100",
  ghost: "text-zinc-600 hover:bg-zinc-100",
  link: "rounded-none px-0 py-0 text-zinc-500 hover:text-blue-600",
};

export function Button({
  variant = "primary",
  fullWidth = true,
  className,
  ...props
}: ButtonProps) {
  const isLink = variant === "link";

  return (
    <button
      {...props}
      className={[
        isLink
          ? "text-sm font-medium transition disabled:opacity-60"
          : "rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60",
        fullWidth && !isLink ? "w-full" : "",
        variantClassName[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
