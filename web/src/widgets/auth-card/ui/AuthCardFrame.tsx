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
    <section className="w-full max-w-md rounded-panel bg-auth-surface p-8 shadow-popover">
      {eyebrow && <p className="text-sm font-medium text-auth-brand">{eyebrow}</p>}
      <h1
        className={[
          "text-2xl font-semibold text-auth",
          eyebrow ? "mt-3" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-auth-muted">{description}</p>
      )}

      <div className="mt-8">{children}</div>
    </section>
  );
}
