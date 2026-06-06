import type { LucideIcon } from "lucide-react";

export type ProfilePanelVariant = "default" | "sidebar";

export type ProfileMetaItem = {
  icon: LucideIcon;
  label: string;
  href?: string;
};
