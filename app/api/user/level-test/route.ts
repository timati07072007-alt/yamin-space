import {
  calcLevelTestRewards,
  resolveKnowledgeTitle,
  type LevelTestAnswer,
} from "@/lib/level-test";
import { createAdminSupabase } from "@/lib/supabase-admin";

interface SubmitPayload {
  userId: number;
  answers: LevelTestAnswer[];
}

function isSubmitPayload(value: unknown): value is SubmitPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as SubmitPayload;

  return (
    Number.isInteger(payload.userId) &&
    payload.userId > 0 &&
    Array.isArray(payload.answers) &&
    payload.answers.every(
      (answer) =>
        Number.isInteger(answer.questionId) &&
        answer.questionId > 0 &&
        Number.isInteger(answer.selectedOptionIndex) &&
        answer.selectedOptionIndex >= 0,
    )
  );
}

interface QuestionRow {
  id: number;
  options: string[];
  correct_option_index: number;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isSubmitPayload(body)) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { userId, answers } = body;
    const supabase = createAdminSupabase();

    const questionIds = answers.map((answer) => answer.questionId);

    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("id, options, correct_option_index")
      .in("id", questionIds);

    if (questionsError) {
      throw new Error(questionsError.message);
    }

    const questionMap = new Map(
      (questionsData as QuestionRow[]).map((question) => [
        question.id,
        question,
      ]),
    );

    const breakdown = answers.map((answer) => {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        return {
          questionId: answer.questionId,
          correct: false,
          correctOptionIndex: 0,
        };
      }

      const correct =
        question.correct_option_index === answer.selectedOptionIndex;

      return {
        questionId: answer.questionId,
        correct,
        correctOptionIndex: question.correct_option_index,
      };
    });

    const score = breakdown.filter((item) => item.correct).length;
    const total = breakdown.length;
    const title = resolveKnowledgeTitle(score, total);
    const { xpAwarded, coinsAwarded } = calcLevelTestRewards(score);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("xp, coins")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!userData) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const currentXp =
      typeof userData.xp === "number" && !Number.isNaN(userData.xp)
        ? userData.xp
        : 0;
    const currentCoins =
      typeof userData.coins === "number" && !Number.isNaN(userData.coins)
        ? userData.coins
        : 0;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        title,
        xp: currentXp + xpAwarded,
        coins: currentCoins + coinsAwarded,
      })
      .eq("id", userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return Response.json({
      score,
      total,
      title,
      xpAwarded,
      coinsAwarded,
      breakdown,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit level test";

    console.error("[API /user/level-test]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
