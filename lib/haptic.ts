import { getTelegramWebApp } from "@/lib/telegram";

export function hapticImpact(style: "light" | "medium" | "heavy" = "light"): void {
  try {
    const webApp = getTelegramWebApp() as
      | (ReturnType<typeof getTelegramWebApp> & {
          HapticFeedback?: {
            impactOccurred: (style: "light" | "medium" | "heavy") => void;
            notificationOccurred: (
              type: "error" | "success" | "warning",
            ) => void;
            selectionChanged: () => void;
          };
        })
      | null;

    webApp?.HapticFeedback?.impactOccurred(style);
  } catch {
    /* optional */
  }
}

export function hapticSuccess(): void {
  try {
    const webApp = getTelegramWebApp() as
      | (ReturnType<typeof getTelegramWebApp> & {
          HapticFeedback?: {
            notificationOccurred: (
              type: "error" | "success" | "warning",
            ) => void;
          };
        })
      | null;

    webApp?.HapticFeedback?.notificationOccurred("success");
  } catch {
    /* optional */
  }
}

export function hapticError(): void {
  try {
    const webApp = getTelegramWebApp() as
      | (ReturnType<typeof getTelegramWebApp> & {
          HapticFeedback?: {
            notificationOccurred: (
              type: "error" | "success" | "warning",
            ) => void;
          };
        })
      | null;

    webApp?.HapticFeedback?.notificationOccurred("error");
  } catch {
    /* optional */
  }
}

export function hapticSelection(): void {
  try {
    const webApp = getTelegramWebApp() as
      | (ReturnType<typeof getTelegramWebApp> & {
          HapticFeedback?: { selectionChanged: () => void };
        })
      | null;

    webApp?.HapticFeedback?.selectionChanged();
  } catch {
    /* optional */
  }
}
