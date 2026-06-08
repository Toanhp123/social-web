export const APP_THEME_STORAGE_KEY = "social-web:theme";
export const APP_NOTIFICATION_SETTINGS_STORAGE_KEY =
  "social-web:notification-settings";

export type AppTheme = "system" | "light" | "dark";

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

