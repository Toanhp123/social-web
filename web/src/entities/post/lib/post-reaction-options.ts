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
    className: "bg-reaction-love-soft text-reaction-love",
  },
  {
    type: "HAHA",
    emoji: "😂",
    label: "Haha",
    countKey: "hahaCount",
    className: "bg-reaction-haha-soft text-reaction-haha",
  },
  {
    type: "WOW",
    emoji: "😮",
    label: "Wow",
    countKey: "wowCount",
    className: "bg-reaction-wow-soft text-reaction-wow",
  },
  {
    type: "SAD",
    emoji: "😢",
    label: "Buồn",
    countKey: "sadCount",
    className: "bg-reaction-sad-soft text-reaction-sad",
  },
  {
    type: "ANGRY",
    emoji: "😡",
    label: "Phẫn nộ",
    countKey: "angryCount",
    className: "bg-danger-soft text-danger",
  },
];

export function getReactionOption(type: ReactionType) {
  return REACTION_OPTIONS.find((reaction) => reaction.type === type) ?? null;
}
