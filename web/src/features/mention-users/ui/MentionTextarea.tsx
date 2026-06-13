"use client";

import type { ChangeEvent, ComponentPropsWithoutRef } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMentionCandidatesQuery } from "@/entities/mention";
import { Avatar } from "@/shared/ui/Avatar";
import { Textarea } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

type MentionTextareaProps = ComponentPropsWithoutRef<typeof Textarea>;
type MentionTextareaOwnProps = MentionTextareaProps & {
  onValueChange?: (value: string) => void;
  wrapperClassName?: string;
};

const ACTIVE_MENTION_PATTERN = /(^|\s)@([a-zA-Z0-9_.]{0,30})$/;
const SUGGESTION_GAP = 8;
const SUGGESTION_MAX_HEIGHT = 280;

type SuggestionPanelPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

export function MentionTextarea({
  value,
  defaultValue,
  onChange,
  onValueChange,
  wrapperClassName,
  className,
  ...props
}: MentionTextareaOwnProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [panelPosition, setPanelPosition] =
    useState<SuggestionPanelPosition | null>(null);
  const [internalValue, setInternalValue] = useState(() =>
    String(value ?? defaultValue ?? ""),
  );
  const [selectionStart, setSelectionStart] = useState(0);
  const textValue = value === undefined ? internalValue : String(value);
  const activeMention = useMemo(
    () => getActiveMention(textValue, selectionStart),
    [selectionStart, textValue],
  );
  const candidatesQuery = useMentionCandidatesQuery(
    activeMention?.query ?? "",
    Boolean(activeMention),
  );
  const candidates = candidatesQuery.data ?? [];
  const shouldShowSuggestions =
    Boolean(activeMention) &&
    (candidates.length > 0 || candidatesQuery.isFetching);

  useEffect(() => {
    if (!shouldShowSuggestions) {
      return;
    }

    let animationFrameId = 0;

    const updatePanelPosition = () => {
      const textarea = textareaRef.current;

      if (!textarea) return;

      const rect = textarea.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - SUGGESTION_GAP;
      const spaceAbove = rect.top - SUGGESTION_GAP;
      const opensAbove =
        spaceBelow < 160 && spaceAbove > spaceBelow && spaceAbove > 120;
      const maxHeight = Math.min(
        SUGGESTION_MAX_HEIGHT,
        Math.max(opensAbove ? spaceAbove : spaceBelow, 120),
      );

      setPanelPosition({
        left: rect.left,
        top: opensAbove
          ? Math.max(SUGGESTION_GAP, rect.top - SUGGESTION_GAP - maxHeight)
          : Math.min(
              viewportHeight - SUGGESTION_GAP - maxHeight,
              rect.bottom + SUGGESTION_GAP,
            ),
        width: rect.width,
        maxHeight,
      });
    };

    const schedulePanelPositionUpdate = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updatePanelPosition);
    };

    schedulePanelPositionUpdate();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", schedulePanelPositionUpdate, true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", schedulePanelPositionUpdate, true);
    };
  }, [selectionStart, shouldShowSuggestions, textValue]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(event.target.value);
    setSelectionStart(event.target.selectionStart);
    onValueChange?.(event.target.value);
    onChange?.(event);
  };

  const handleSelectCandidate = (username: string | null) => {
    if (!username || !activeMention) {
      return;
    }

    const nextValue = `${textValue.slice(0, activeMention.start)}@${username} ${textValue.slice(selectionStart)}`;
    setInternalValue(nextValue);
    onValueChange?.(nextValue);

    const textarea = textareaRef.current;
    const nextCursor = activeMention.start + username.length + 2;

    if (textarea) {
      textarea.value = nextValue;
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    }

    setSelectionStart(nextCursor);
  };

  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Textarea
        {...props}
        ref={textareaRef}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={handleChange}
        onSelect={(event) =>
          setSelectionStart(event.currentTarget.selectionStart)
        }
        onKeyUp={(event) =>
          setSelectionStart(event.currentTarget.selectionStart)
        }
        className={className}
      />

      {shouldShowSuggestions &&
        panelPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="border-surface-border bg-surface shadow-popover rounded-card fixed z-[10000] overflow-y-auto border p-1"
            style={{
              left: panelPosition.left,
              top: panelPosition.top,
              width: panelPosition.width,
              maxHeight: panelPosition.maxHeight,
            }}
          >
            {candidatesQuery.isFetching && candidates.length === 0 ? (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="bg-surface-muted size-8 animate-pulse rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="bg-surface-muted h-3 w-32 animate-pulse rounded" />
                  <div className="bg-surface-muted h-2 w-20 animate-pulse rounded" />
                </div>
              </div>
            ) : (
              candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelectCandidate(candidate.username);
                  }}
                  className={cn(
                    "hover:bg-surface-soft rounded-control flex w-full items-center gap-3 px-3 py-2 text-left transition",
                  )}
                >
                  <Avatar
                    src={candidate.avatarUrl}
                    alt={`${candidate.fullName} avatar`}
                    name={candidate.fullName}
                    size={32}
                  />
                  <span className="min-w-0">
                    <span className="text-primary block truncate text-sm font-semibold">
                      {candidate.fullName}
                    </span>
                    <span className="text-muted block truncate text-xs">
                      @{candidate.username}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

function getActiveMention(value: string, cursor: number) {
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(ACTIVE_MENTION_PATTERN);

  if (!match) {
    return null;
  }

  const query = match[2] ?? "";

  return {
    query,
    start: cursor - query.length - 1,
  };
}
