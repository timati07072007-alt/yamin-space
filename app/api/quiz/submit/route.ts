import { createAdminSupabase } from "@/lib/supabase-admin";

interface SubmitPayload {
  userId: number;
  questionId: number;
  selectedOptionIndex: number;
}

function isSubmitPayload(value: unknown): value is SubmitPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as SubmitPayload;

  return (
    Number.isInteger(payload.userId) &&
    payload.userId > 0 &&
    Number.isInteger(payload.questionId) &&
    payload.questionId > 0 &&
    Number.isInteger(payload.selectedOptionIndex) &&
    payload.selectedOptionIndex >= 0
  );
}

interface QuestionRow {
  id: number;
  options: string[];
  correct_option_index: number;
  xp_reward: number;
  coins_reward: number;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isSubmitPayload(body)) {
      return Response.json(
        { error: "Invalid submit payload" },
        { status: 400 },
      );
    }

    const { userId, questionId, selectedOptionIndex } = body;
    const supabase = createAdminSupabase();

    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .select("id, options, correct_option_index, xp_reward, coins_reward")
      .eq("id", questionId)
      .maybeSingle();

    if (questionError) {
      throw new Error(questionError.message);
    }

    if (!questionData) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }

    const question = questionData as QuestionRow;

    if (selectedOptionIndex >= question.options.length) {
      return Response.json(
        { error: "Option index out of range" },
        { status: 400 },
      );
    }

    const correct = question.correct_option_index === selectedOptionIndex;

    // Уникальный индекс (user_id, question_id) защищает от повторного фарма
    const { error: answerError } = await supabase.from("quiz_answers").insert({
      user_id: userId,
      question_id: questionId,
      selected_option_index: selectedOptionIndex,
      is_correct: correct,
    });

    if (answerError) {
      const isDuplicate = answerError.code === "23505";

      if (isDuplicate) {
        return Response.json({
          correct,
          correctOptionIndex: question.correct_option_index,
          xpAwarded: 0,
          coinsAwarded: 0,
          alreadyAnswered: true,
        });
      }

      throw new Error(answerError.message);
    }

    let xpAwarded = 0;
    let coinsAwarded = 0;

    if (correct) {
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

      xpAwarded = question.xp_reward;
      coinsAwarded = question.coins_reward;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          xp: currentXp + xpAwarded,
          coins: currentCoins + coinsAwarded,
        })
        .eq("id", userId);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    return Response.json({
      correct,
      correctOptionIndex: question.correct_option_index,
      xpAwarded,
      coinsAwarded,
      alreadyAnswered: false,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit answer";

    console.error("[API /quiz/submit]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
