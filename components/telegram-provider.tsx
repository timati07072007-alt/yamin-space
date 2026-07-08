import type { ReactNode } from "react";

import { TelegramContextProvider } from "@/components/telegram-context";

export { useTelegram } from "@/components/telegram-context";

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  return <TelegramContextProvider>{children}</TelegramContextProvider>;
}
