import { supabase } from "@/lib/supabase";
import type { TelegramUser } from "@/lib/telegram";

export interface DbUser {
  id: number;
  username: string | null;
  first_name: string;
  xp: number;
  coins: number;
  title: string;
  last_seen: string;
}

export const DEV_MOCK_USER: DbUser = {
  id: 0,
  username: "dev",
  first_name: "Разработчик",
  xp: 120,
  coins: 50,
  title: "Искатель",
  last_seen: new Date().toISOString(),
};

export async function syncTelegramUser(
  telegramUser: TelegramUser,
): Promise<DbUser> {
  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", telegramUser.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!existing) {
    const { data: inserted, error: insertError } = await supabase
      .from("users")
      .insert({
        id: telegramUser.id,
        username: telegramUser.username ?? null,
        first_name: telegramUser.first_name,
      })
      .select("*")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return inserted as DbUser;
  }

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", telegramUser.id)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return updated as DbUser;
}
