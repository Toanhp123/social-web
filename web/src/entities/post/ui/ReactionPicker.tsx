import { cn } from "@/shared/lib/utils";
import type { Post, ReactionType } from "../model/types";
import { REACTION_OPTIONS } from "../lib/post-reaction-options";

type ReactionPickerProps = {
  currentReaction: ReactionType | null;
  reactionStats: Post["reactionStats"];
  isReacting?: boolean;
  onSelectReaction: (type: ReactionType | null) => void;
};

export function ReactionPicker({
  currentReaction,
  reactionStats,
  isReacting,
  onSelectReaction,
}: ReactionPickerProps) {
  return (
    <div className="absolute bottom-full left-0 z-50 pb-2">
      <div
        role="group"
        aria-label="Chọn cảm xúc"
        className="rounded-pill border-soft bg-surface shadow-popover flex w-max max-w-[calc(100vw-2rem)] items-center gap-1 border p-1.5"
      >
        {REACTION_OPTIONS.map((reaction) => {
          const isActive = currentReaction === reaction.type;
          const count = reactionStats[reaction.countKey];

          return (
            <button
              key={reaction.type}
              type="button"
              disabled={isReacting}
              onClick={() => onSelectReaction(isActive ? null : reaction.type)}
              className={cn(
                "group/reaction rounded-pill hover:bg-surface-soft relative grid size-10 shrink-0 place-items-center text-xl transition hover:-translate-y-1",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isActive && reaction.className,
              )}
              aria-pressed={isActive}
              aria-label={`${reaction.label}${count > 0 ? `, ${count} lượt` : ""}`}
            >
              <span aria-hidden>{reaction.emoji}</span>

              <span className="rounded-pill bg-surface-inverse text-inverse pointer-events-none absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 px-2 py-1 text-[11px] font-medium whitespace-nowrap group-hover/reaction:block">
                {reaction.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
