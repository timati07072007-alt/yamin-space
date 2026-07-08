import { createAdminSupabase } from "@/lib/supabase-admin";

export type AcademyDifficulty = "easy" | "medium" | "hardcore";

const QUIZ_BY_DIFFICULTY: Record<AcademyDifficulty, number> = {
  easy: 4,
  medium: 5,
  hardcore: 6,
};

const VALID: AcademyDifficulty[] = ["easy", "medium", "hardcore"];

export async function GET(request: Request) {
  try {
    const difficulty = new URL(request.url).searchParams.get(
      "difficulty",
    ) as AcademyDifficulty | null;

    if (!difficulty || !VALID.includes(difficulty)) {
      return Response.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    const limitParam = new URL(request.url).searchParams.get("limit");
    const limit = limitParam ? Math.min(Number(limitParam), 30) : 20;

    const supabase = createAdminSupabase();
    const quizId = QUIZ_BY_DIFFICULTY[difficulty];

    const { data, error } = await supabase
      .from("questions")
      .select("id, quiz_id, question_text, options, xp_reward, coins_reward")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true })
      .limit(limit);

    if (error) throw new Error(error.message);

    return Response.json({ questions: data ?? [], difficulty, quizId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
