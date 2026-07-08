import { createAdminSupabase } from "@/lib/supabase-admin";

const LEVEL_TEST_QUIZ_ID = 3;

export async function GET() {
  try {
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from("questions")
      .select("id, quiz_id, question_text, options, xp_reward, coins_reward")
      .eq("quiz_id", LEVEL_TEST_QUIZ_ID)
      .order("id", { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ questions: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load level test";

    console.error("[API /quiz/level-test]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
