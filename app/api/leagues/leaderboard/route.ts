import { createAdminSupabase } from "@/lib/supabase-admin";
import type { LeagueTier } from "@/lib/gamification";

const VALID: LeagueTier[] = ["bronze", "silver", "gold", "emerald"];

export async function GET(request: Request) {
  try {
    const tier = new URL(request.url).searchParams.get("tier") as LeagueTier | null;

    if (!tier || !VALID.includes(tier)) {
      return Response.json({ error: "Invalid tier" }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("id, display_name, avatar_id, weekly_xp, league_tier")
      .eq("league_tier", tier)
      .order("weekly_xp", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    const { data: avatars, error: avatarsError } = await supabase
      .from("user_avatars")
      .select("id, emoji");

    if (avatarsError) throw new Error(avatarsError.message);

    const emojiById = new Map(
      (avatars ?? []).map((row) => [row.id as string, row.emoji as string]),
    );

    const entries = (data ?? []).map((row, index) => {
      const avatarId = (row.avatar_id as string) ?? "mosque";
      return {
        user_id: row.id as number,
        display_name: (row.display_name as string) ?? "Искатель",
        avatar_id: avatarId,
        avatar_emoji: emojiById.get(avatarId) ?? "✨",
        weekly_xp: row.weekly_xp as number,
        league_tier: row.league_tier as LeagueTier,
        rank: index + 1,
      };
    });

    return Response.json({ entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
