"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "@/shared/i18n";
import { Button } from "@/shared/ui";

type PostContentProps = {
  content: string;
  className?: string;
};

const POST_CONTENT_PREVIEW_LENGTH = 280;
const POST_CONTENT_PREVIEW_LINES = 5;

export function PostContent({ content, className }: PostContentProps) {
  const t = useTranslations().post;
  const [isExpanded, setIsExpanded] = useState(false);

  const lineCount = content.split(/\r\n|\r|\n/).length;

  const shouldCollapse =
    content.length > POST_CONTENT_PREVIEW_LENGTH ||
    lineCount > POST_CONTENT_PREVIEW_LINES;

  return (
    <div className={cn("mt-4", className)}>
      <p
        className={cn(
          "text-secondary text-sm leading-6 wrap-anywhere whitespace-pre-wrap",
          shouldCollapse && !isExpanded && "line-clamp-5",
        )}
      >
        {content}
      </p>

      {shouldCollapse && (
        <Button
          type="button"
          variant="link"
          fullWidth={false}
          onClick={() => setIsExpanded((current) => !current)}
          className="text-primary hover:text-brand mt-1 text-sm font-semibold"
        >
          {isExpanded ? t.showLess : t.showMore}
        </Button>
      )}
    </div>
  );
}
