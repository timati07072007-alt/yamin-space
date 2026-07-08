import { getDailyIndices } from "@/lib/daily-content";
import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from("questions")
      .select("id, quiz_id, question_text, options, xp_reward, coins_reward")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const all = data ?? [];

    if (all.length === 0) {
      return Response.json({ questions: [] });
    }

    const indices = getDailyIndices("daily-quiz", 3, all.length);
    const questions = indices.map((index) => all[index]);

    return Response.json({ questions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load daily quiz";

    console.error("[API /quiz/daily]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
