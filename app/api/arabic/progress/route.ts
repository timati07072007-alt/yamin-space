import { createAdminSupabase } from "@/lib/supabase-admin";
import { applySm2 } from "@/lib/arabic-spaced-repetition";

const VALID = new Set(["again", "hard", "good", "easy"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId: number;
      wordId: number;
      result: string;
    };

    const userId = Number(body.userId);
    const wordId = Number(body.wordId);
    const result = body.result;

    if (!Number.isInteger(userId) || userId <= 0) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }
    if (!Number.isInteger(wordId) || wordId <= 0) {
      return Response.json({ error: "Invalid word" }, { status: 400 });
    }
    if (!VALID.has(result)) {
      return Response.json({ error: "Invalid result" }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    const { data: existing } = await supabase
      .from("arabic_word_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("word_id", wordId)
      .maybeSingle();

    const sm2 = applySm2(
      existing
        ? {
            ease_factor: Number(existing.ease_factor),
            interval_days: existing.interval_days as number,
            repetitions: existing.repetitions as number,
          }
        : null,
      result as "again" | "hard" | "good" | "easy",
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + sm2.interval_days);

    const row = {
      user_id: userId,
      word_id: wordId,
      ease_factor: sm2.ease_factor,
      interval_days: sm2.interval_days,
      repetitions: sm2.repetitions,
      next_review_at: nextReview.toISOString(),
      last_result: result,
      xp_earned: (existing?.xp_earned as number | undefined ?? 0) + sm2.xp,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("arabic_word_progress").upsert(row, {
      onConflict: "user_id,word_id",
    });

    if (error) throw new Error(error.message);

    return Response.json({ xp: sm2.xp });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
