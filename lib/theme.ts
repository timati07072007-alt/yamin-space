export type AppThemeId = "emerald" | "night" | "gold";

export interface AppTheme {
  id: AppThemeId;
  label: string;
  description: string;
  preview: string;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: "emerald",
    label: "Уютный Изумруд",
    description: "Светлая пастель с мягким зелёным",
    preview: "linear-gradient(135deg, #d1fae5, #fef3c7)",
  },
  {
    id: "night",
    label: "Ночной Сад",
    description: "Мягкая тёмная тема для чтения ночью",
    preview: "linear-gradient(135deg, #1e293b, #334155)",
  },
  {
    id: "gold",
    label: "Тёплое Золото",
    description: "Кремово-золотые оттенки",
    preview: "linear-gradient(135deg, #fef3c7, #fde68a)",
  },
];

export const THEME_STORAGE_KEY = "yamin-theme";
