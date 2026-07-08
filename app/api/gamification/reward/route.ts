import { createAdminSupabase } from "@/lib/supabase-admin";
import { getBishkekWeekKey, resolveLeagueTier } from "@/lib/gamification";

interface Payload {
  userId: number;
  xpAwarded: number;
  diamondAward?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const userId = Number(body.userId);
    const xpAwarded = Number(body.xpAwarded);
    const diamondAward = Number(body.diamondAward ?? 0);

    if (!Number.isInteger(userId) || userId <= 0) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const weekKey = getBishkekWeekKey();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("xp, weekly_xp, week_key")
      .eq("id", userId)
      .maybeSingle();

    if (userError) throw new Error(userError.message);
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    let weeklyXp = user.weekly_xp as number;
    if ((user.week_key as string) !== weekKey) {
      weeklyXp = 0;
    }
    weeklyXp += Math.max(0, xpAwarded);

    const leagueTier = resolveLeagueTier(weeklyXp);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        xp: (user.xp as number) + Math.max(0, xpAwarded),
        weekly_xp: weeklyXp,
        week_key: weekKey,
        league_tier: leagueTier,
      })
      .eq("id", userId);

    if (updateError) throw new Error(updateError.message);

    let diamondsGranted = 0;

    if (diamondAward > 0) {
      const { data: bal } = await supabase
        .from("diamonds_balance")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      const next = (bal?.balance as number | undefined ?? 0) + diamondAward;

      const { error: dErr } = await supabase
        .from("diamonds_balance")
        .upsert({
          user_id: userId,
          balance: next,
          updated_at: new Date().toISOString(),
        });

      if (dErr) throw new Error(dErr.message);
      diamondsGranted = diamondAward;
    }

    return Response.json({ weeklyXp, leagueTier, diamondsGranted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
