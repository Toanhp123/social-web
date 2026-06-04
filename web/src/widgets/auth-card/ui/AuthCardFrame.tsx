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
    <section className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-xl">
      {eyebrow && <p className="text-sm font-medium text-blue-300">{eyebrow}</p>}
      <h1
        className={[
          "text-2xl font-semibold text-white",
          eyebrow ? "mt-3" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
      )}

      <div className="mt-8">{children}</div>
    </section>
  );
}
