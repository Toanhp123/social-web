export const APP_THEME_STORAGE_KEY = "social-web:theme";
export const APP_FONT_SIZE_STORAGE_KEY = "social-web:font-size";
export const APP_NOTIFICATION_SETTINGS_STORAGE_KEY =
  "social-web:notification-settings";

export type AppTheme = "system" | "light" | "dark";

export const MIN_APP_FONT_SIZE = 14;
export const MAX_APP_FONT_SIZE = 20;
export const DEFAULT_APP_FONT_SIZE = 16;
export const APP_FONT_SIZE_STEP = 1;
export type AppFontSize = number;

export type NotificationSettings = {
  inApp: boolean;
  comments: boolean;
  reactions: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  inApp: true,
  comments: true,
  reactions: true,
};
