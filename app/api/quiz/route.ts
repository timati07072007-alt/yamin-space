import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from("quizzes")
      .select("id, title, category, difficulty")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ quizzes: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load quizzes";

    console.error("[API /quiz]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
