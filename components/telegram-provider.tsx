import Script from 'next/script';
import type { ReactNode } from "react";

import { TelegramContextProvider } from "@/components/telegram-context";

export { useTelegram } from "@/components/telegram-context";

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TelegramContextProvider>{children}</TelegramContextProvider>
    </>
  );
}
