"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Input } from "./input";

type SearchFieldProps = ComponentPropsWithoutRef<typeof Input> & {
  icon?: ReactNode;
  wrapperClassName?: string;
};

export function SearchField({
  icon = <Search className="size-4" />,
  wrapperClassName,
  className,
  ...props
}: SearchFieldProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <span className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
        {icon}
      </span>
      <Input {...props} className={cn("pl-9", className)} />
    </div>
  );
}
