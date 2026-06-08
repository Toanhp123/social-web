import type { Post, ReactionType } from "../model/types";

export type PostReactionOption = {
  type: ReactionType;
  emoji: string;
  label: string;
  countKey: keyof Post["reactionStats"];
  className: string;
};

export const REACTION_OPTIONS: PostReactionOption[] = [
  {
    type: "LIKE",
    emoji: "👍",
    label: "Thích",
    countKey: "likeCount",
    className: "text-brand bg-brand-soft",
  },
  {
    type: "LOVE",
    emoji: "❤️",
    label: "Yêu thích",
    countKey: "loveCount",
    className: "text-rose-600 bg-rose-50",
  },
  {
    type: "HAHA",
    emoji: "😂",
    label: "Haha",
    countKey: "hahaCount",
    className: "text-amber-600 bg-amber-50",
  },
  {
    type: "WOW",
    emoji: "😮",
    label: "Wow",
    countKey: "wowCount",
    className: "text-violet-600 bg-violet-50",
  },
  {
    type: "SAD",
    emoji: "😢",
    label: "Buồn",
    countKey: "sadCount",
    className: "text-sky-700 bg-sky-50",
  },
  {
    type: "ANGRY",
    emoji: "😡",
    label: "Phẫn nộ",
    countKey: "angryCount",
    className: "text-red-700 bg-danger-soft",
  },
];

export function getReactionOption(type: ReactionType) {
  return REACTION_OPTIONS.find((reaction) => reaction.type === type) ?? null;
}
