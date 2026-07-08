"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getTelegramWebApp,
  type TelegramUser,
  type TelegramWebApp,
} from "@/lib/telegram";
import {
  DEV_MOCK_USER,
  syncUserViaApi,
  type DbUser,
} from "@/lib/users";

const TELEGRAM_SDK_MAX_ATTEMPTS = 25;
const TELEGRAM_SDK_RETRY_MS = 100;

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  telegramUser: TelegramUser | null;
  dbUser: DbUser | null;
  isReady: boolean;
  isTelegram: boolean;
  isDevMode: boolean;
  syncError: string | null;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function waitForTelegramSession(): Promise<{
  app: TelegramWebApp;
  user: TelegramUser;
} | null> {
  for (let attempt = 0; attempt < TELEGRAM_SDK_MAX_ATTEMPTS; attempt += 1) {
    const app = getTelegramWebApp();
    const user = app?.initDataUnsafe.user ?? null;

    if (app && user) {
      return { app, user };
    }

    await delay(TELEGRAM_SDK_RETRY_MS);
  }

  return null;
}

function applyTelegramTheme(app: TelegramWebApp): void {
  try {
    app.setHeaderColor("#0f766e");
    app.setBackgroundColor("#f4f4f5");
  } catch (error) {
    console.warn("[Telegram] Failed to apply theme colors:", error);
  }
}

export function TelegramContextProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeTelegram() {
      try {
        const session = await waitForTelegramSession();

        if (!session) {
          console.warn(
            "[Telegram] WebApp SDK is unavailable. Running in development mode.",
          );

          if (isMounted) {
            setIsTelegram(false);
            setIsDevMode(true);
            setDbUser(DEV_MOCK_USER);
          }
          return;
        }

        const { app, user } = session;

        app.ready();
        app.expand();
        applyTelegramTheme(app);

        if (isMounted) {
          setIsTelegram(true);
          setIsDevMode(false);
          setWebApp(app);
          setTelegramUser(user);
        }

        const syncedUser = await syncUserViaApi(user);

        if (isMounted) {
          setDbUser(syncedUser);
          setSyncError(null);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to sync user with Supabase";

        console.error("[Telegram] Initialization failed:", message);

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
      isTelegram,
      isDevMode,
      syncError,
    }),
    [webApp, telegramUser, dbUser, isReady, isTelegram, isDevMode, syncError],
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
