"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEV_MOCK_USER, syncTelegramUser, type DbUser } from "@/lib/users";
import {
  getTelegramWebApp,
  type TelegramUser,
  type TelegramWebApp,
} from "@/lib/telegram";

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  telegramUser: TelegramUser | null;
  dbUser: DbUser | null;
  isReady: boolean;
  isDevMode: boolean;
  syncError: string | null;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramContextProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeTelegram() {
      const app = getTelegramWebApp();
      const tgUser = app?.initDataUnsafe.user ?? null;

      if (!app || !tgUser) {
        console.warn(
          "[Telegram] WebApp SDK is unavailable. Running in development mode.",
        );

        if (isMounted) {
          setIsDevMode(true);
          setDbUser(DEV_MOCK_USER);
          setIsReady(true);
        }
        return;
      }

      app.ready();
      app.expand();

      if (isMounted) {
        setWebApp(app);
        setTelegramUser(tgUser);
      }

      try {
        const syncedUser = await syncTelegramUser(tgUser);

        if (isMounted) {
          setDbUser(syncedUser);
          setSyncError(null);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to sync user with Supabase";

        console.error("[Telegram] User sync failed:", message);

        if (isMounted) {
          setSyncError(message);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    void initializeTelegram();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      webApp,
      telegramUser,
      dbUser,
      isReady,
      isDevMode,
      syncError,
    }),
    [webApp, telegramUser, dbUser, isReady, isDevMode, syncError],
  );

  return (
    <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextValue {
  const context = useContext(TelegramContext);

  if (!context) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }

  return context;
}
