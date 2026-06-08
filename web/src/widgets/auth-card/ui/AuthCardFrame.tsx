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
    <section className="w-full max-w-md rounded-panel border border-surface bg-surface p-8 shadow-popover">
      {eyebrow && <p className="text-sm font-medium text-brand">{eyebrow}</p>}
      <h1
        className={[
          "text-2xl font-semibold text-primary",
          eyebrow ? "mt-3" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-muted">{description}</p>
      )}

      <div className="mt-8">{children}</div>
    </section>
  );
}
