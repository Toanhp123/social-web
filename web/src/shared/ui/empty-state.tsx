import type { ReactNode } from "react";
import { Card } from "./card";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <Card
      variant="elevated"
      padding="lg"
      className={className ?? "grid min-h-40 place-items-center text-center"}
    >
      <div>
        {icon && <div className="text-muted mx-auto flex justify-center">{icon}</div>}
        <h2 className="text-primary mt-3 font-semibold">{title}</h2>
        {description && (
          <p className="text-muted mt-1 text-sm leading-6">{description}</p>
        )}
      </div>
    </Card>
  );
}
