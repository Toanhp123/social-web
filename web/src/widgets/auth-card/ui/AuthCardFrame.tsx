import type { ReactNode } from "react";

type AuthCardFrameProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
};

export function AuthCardFrame({
  title,
  description,
  eyebrow,
  children,
}: AuthCardFrameProps) {
  return (
    <section className="rounded-card border-surface-border bg-surface shadow-card w-full max-w-md border p-5 sm:rounded-panel sm:p-8 sm:shadow-popover">
      {eyebrow && <p className="text-brand text-sm font-medium">{eyebrow}</p>}
      <h1
        className={[
          "text-primary text-xl font-semibold sm:text-2xl",
          eyebrow ? "mt-3" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </h1>
      {description && <p className="text-muted mt-2 text-sm">{description}</p>}

      <div className="mt-6 sm:mt-8">{children}</div>
    </section>
  );
}
