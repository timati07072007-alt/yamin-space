"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { APP_THEMES, THEME_STORAGE_KEY, type AppThemeId } from "@/lib/theme";

interface ThemeContextValue {
  themeId: AppThemeId;
  setThemeId: (id: AppThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): AppThemeId {
  if (typeof window === "undefined") return "emerald";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "emerald" || stored === "night" || stored === "gold") {
    return stored;
  }
  return "emerald";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<AppThemeId>(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  const setThemeId = useCallback((id: AppThemeId) => {
    setThemeIdState(id);
  }, []);

  const value = useMemo(
    () => ({ themeId, setThemeId }),
    [themeId, setThemeId],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export { APP_THEMES };
