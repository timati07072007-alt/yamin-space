import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const { quizId } = await params;
    const parsedQuizId = Number(quizId);

    if (!Number.isInteger(parsedQuizId) || parsedQuizId <= 0) {
      return Response.json({ error: "Invalid quiz id" }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    // correct_option_index намеренно не отдаём клиенту — ответ проверяет сервер
    const { data, error } = await supabase
      .from("questions")
      .select("id, quiz_id, question_text, options, xp_reward, coins_reward")
      .eq("quiz_id", parsedQuizId)
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ questions: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load questions";

    console.error("[API /quiz/questions]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
