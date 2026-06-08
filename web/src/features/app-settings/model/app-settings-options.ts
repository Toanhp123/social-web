import {
  Bell,
  Languages,
  MessageCircle,
  Monitor,
  Moon,
  Sun,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import type { AppLanguage } from "@/shared/i18n";
import type {
  AppTheme,
  NotificationSettings,
} from "./app-settings";

export const themeOptions: Array<{
  value: AppTheme;
  icon: LucideIcon;
}> = [
  { value: "system", icon: Monitor },
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
];

export const languageOptions: Array<{
  value: AppLanguage;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "vi", label: "VI", icon: Languages },
  { value: "en", label: "EN", icon: Languages },
];

export const notificationOptions: Array<{
  key: keyof NotificationSettings;
  icon: LucideIcon;
}> = [
  { key: "inApp", icon: Bell },
  { key: "comments", icon: MessageCircle },
  { key: "reactions", icon: ThumbsUp },
];
