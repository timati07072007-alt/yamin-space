import type { SupabaseClient } from "@supabase/supabase-js";

import type { LeagueTier } from "@/lib/gamification";
import { getBishkekWeekKey, resolveLeagueTier } from "@/lib/gamification";
import type { TelegramUser } from "@/lib/telegram";

export interface DbUser {
  id: number;
  username: string | null;
  first_name: string;
  display_name: string | null;
  avatar_id: string;
  xp: number;
  coins: number;
  diamonds: number;
  title: string;
  league_tier: LeagueTier;
  weekly_xp: number;
  last_seen: string;
}

export const DEV_MOCK_USER: DbUser = {
  id: 0,
  username: "dev",
  first_name: "Разработчик",
  display_name: "Разработчик",
  avatar_id: "mosque",
  xp: 120,
  coins: 50,
  diamonds: 2,
  title: "Искатель",
  league_tier: "bronze",
  weekly_xp: 80,
  last_seen: new Date().toISOString(),
};

async function attachDiamonds(
  supabase: SupabaseClient,
  user: Record<string, unknown>,
): Promise<DbUser> {
  const { data } = await supabase
    .from("diamonds_balance")
    .select("balance")
    .eq("user_id", user.id as number)
    .maybeSingle();

  return {
    id: user.id as number,
    username: (user.username as string | null) ?? null,
    first_name: user.first_name as string,
    display_name: (user.display_name as string | null) ?? (user.first_name as string),
    avatar_id: (user.avatar_id as string) ?? "mosque",
    xp: user.xp as number,
    coins: user.coins as number,
    diamonds: (data?.balance as number | undefined) ?? 0,
    title: user.title as string,
    league_tier: (user.league_tier as LeagueTier) ?? "bronze",
    weekly_xp: (user.weekly_xp as number) ?? 0,
    last_seen: user.last_seen as string,
  };
}

export async function syncTelegramUser(
  supabase: SupabaseClient,
  telegramUser: TelegramUser,
): Promise<DbUser> {
  const weekKey = getBishkekWeekKey();

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
        display_name: telegramUser.first_name,
        week_key: weekKey,
        league_tier: "bronze",
      })
      .select("*")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    await ensureDiamondsRow(supabase, telegramUser.id);

    return attachDiamonds(supabase, inserted);
  }

  const resetWeekly = (existing.week_key as string) !== weekKey;

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({
      last_seen: new Date().toISOString(),
      username: telegramUser.username ?? null,
      first_name: telegramUser.first_name,
      ...(resetWeekly
        ? {
            week_key: weekKey,
            weekly_xp: 0,
            league_tier: "bronze",
          }
        : {}),
    })
    .eq("id", telegramUser.id)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  await ensureDiamondsRow(supabase, telegramUser.id);

  return attachDiamonds(supabase, updated);
}

async function ensureDiamondsRow(
  supabase: SupabaseClient,
  userId: number,
): Promise<void> {
  const { data } = await supabase
    .from("diamonds_balance")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    const { error } = await supabase
      .from("diamonds_balance")
      .insert({ user_id: userId, balance: 0 });

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function syncUserViaApi(
  telegramUser: TelegramUser,
): Promise<DbUser> {
  const response = await fetch("/api/user/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(telegramUser),
  });

  const payload = (await response.json()) as {
    user?: DbUser;
    error?: string;
  };

  if (!response.ok || !payload.user) {
    throw new Error(payload.error ?? "Failed to sync user with Supabase");
  }

  return payload.user;
}

export async function updateUserProfile(
  userId: number,
  patch: { displayName?: string; avatarId?: string },
): Promise<DbUser> {
  const response = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      displayName: patch.displayName,
      avatarId: patch.avatarId,
    }),
  });

  const payload = (await response.json()) as {
    user?: DbUser;
    error?: string;
  };

  if (!response.ok || !payload.user) {
    throw new Error(payload.error ?? "Failed to update profile");
  }

  return payload.user;
}

export function normalizeDbUser(raw: Partial<DbUser> & Pick<DbUser, "id">): DbUser {
  return {
    id: raw.id,
    username: raw.username ?? null,
    first_name: raw.first_name ?? "Искатель",
    display_name: raw.display_name ?? raw.first_name ?? "Искатель",
    avatar_id: raw.avatar_id ?? "mosque",
    xp: raw.xp ?? 0,
    coins: raw.coins ?? 0,
    diamonds: raw.diamonds ?? 0,
    title: raw.title ?? "Искатель",
    league_tier: raw.league_tier ?? resolveLeagueTier(raw.weekly_xp ?? 0),
    weekly_xp: raw.weekly_xp ?? 0,
    last_seen: raw.last_seen ?? new Date().toISOString(),
  };
}
