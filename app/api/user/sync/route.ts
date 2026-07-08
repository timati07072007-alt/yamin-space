import { createAdminSupabase } from "@/lib/supabase-admin";
import type { TelegramUser } from "@/lib/telegram";
import { syncTelegramUser } from "@/lib/users";

function isTelegramUser(value: unknown): value is TelegramUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as TelegramUser;

  return (
    typeof user.id === "number" &&
    Number.isInteger(user.id) &&
    user.id > 0 &&
    typeof user.first_name === "string" &&
    user.first_name.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isTelegramUser(body)) {
      return Response.json(
        { error: "Invalid Telegram user payload" },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabase();
    const user = await syncTelegramUser(supabase, body);

    return Response.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync user";

    console.error("[API /user/sync]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
