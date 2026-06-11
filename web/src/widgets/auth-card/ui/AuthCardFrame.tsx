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
    <section className="rounded-panel border-surface-border bg-surface shadow-popover w-full max-w-md border p-8">
      {eyebrow && <p className="text-brand text-sm font-medium">{eyebrow}</p>}
      <h1
        className={[
          "text-primary text-2xl font-semibold",
          eyebrow ? "mt-3" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </h1>
      {description && <p className="text-muted mt-2 text-sm">{description}</p>}

      <div className="mt-8">{children}</div>
    </section>
  );
}
