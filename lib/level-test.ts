import type { QuizQuestion } from "@/lib/quiz";

export type KnowledgeTitle = "Новичок" | "Знаток" | "Мудрец";

export interface LevelTestAnswer {
  questionId: number;
  selectedOptionIndex: number;
}

export interface LevelTestResult {
  score: number;
  total: number;
  title: KnowledgeTitle;
  xpAwarded: number;
  coinsAwarded: number;
  breakdown: Array<{
    questionId: number;
    correct: boolean;
    correctOptionIndex: number;
  }>;
}

export function resolveKnowledgeTitle(
  score: number,
  total: number,
): KnowledgeTitle {
  const ratio = total > 0 ? score / total : 0;

  if (ratio >= 0.8) {
    return "Мудрец";
  }

  if (ratio >= 0.4) {
    return "Знаток";
  }

  return "Новичок";
}

export function calcLevelTestRewards(score: number): {
  xpAwarded: number;
  coinsAwarded: number;
} {
  return {
    xpAwarded: score * 8,
    coinsAwarded: score * 4,
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Ошибка запроса к серверу");
  }

  return payload;
}

export async function fetchLevelTestQuestions(): Promise<QuizQuestion[]> {
  const response = await fetch("/api/quiz/level-test");
  const payload = await readJson<{ questions: QuizQuestion[] }>(response);
  return payload.questions;
}

export async function submitLevelTest(
  userId: number,
  answers: LevelTestAnswer[],
): Promise<LevelTestResult> {
  const response = await fetch("/api/user/level-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, answers }),
  });

  return readJson<LevelTestResult>(response);
}

// ---------------------------------------------------------------------------
// DEV
// ---------------------------------------------------------------------------

const DEV_LEVEL_QUESTIONS: Array<
  QuizQuestion & { correct_option_index: number }
> = [
  {
    id: 301,
    quiz_id: 3,
    question_text: "Сколько столпов Ислама?",
    options: ["Три", "Пять", "Семь", "Девять"],
    correct_option_index: 1,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 302,
    quiz_id: 3,
    question_text: "Как называется первый месяц исламского календаря?",
    options: ["Рамадан", "Мухаррам", "Шавваль", "Раджаб"],
    correct_option_index: 1,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 303,
    quiz_id: 3,
    question_text: "Кто был первым Пророком?",
    options: ["Нух (а.с.)", "Ибрахим (а.с.)", "Адам (а.с.)", "Муса (а.с.)"],
    correct_option_index: 2,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 304,
    quiz_id: 3,
    question_text: "Сколько раз в день совершается обязательный намаз?",
    options: ["Три", "Четыре", "Пять", "Шесть"],
    correct_option_index: 2,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 305,
    quiz_id: 3,
    question_text: "Как называется пост в месяц Рамадан?",
    options: ["Закят", "Саум", "Хадж", "Итикaf"],
    correct_option_index: 1,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 306,
    quiz_id: 3,
    question_text: "В каком городе родился Пророк Мухаммад ﷺ?",
    options: ["Медина", "Мекка", "Иерусалим", "Дамаск"],
    correct_option_index: 1,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 307,
    quiz_id: 3,
    question_text: "Как называется паломничество в Мекку?",
    options: ["Умра", "Хадж", "Итикaf", "Таравих"],
    correct_option_index: 1,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 308,
    quiz_id: 3,
    question_text: "Кто принёс Пророку ﷺ первое откровение?",
    options: ["Микаил", "Джибриль", "Исрафил", "Азраил"],
    correct_option_index: 1,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 309,
    quiz_id: 3,
    question_text: "Как называется ежегодная милостыня в Исламе?",
    options: ["Садака", "Закят", "Фитр", "Хумс"],
    correct_option_index: 1,
    xp_reward: 0,
    coins_reward: 0,
  },
  {
    id: 310,
    quiz_id: 3,
    question_text: "Сколько сур в Коране?",
    options: ["100", "114", "120", "99"],
    correct_option_index: 1,
    xp_reward: 0,
    coins_reward: 0,
  },
];

export async function fetchDevLevelTestQuestions(): Promise<QuizQuestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return DEV_LEVEL_QUESTIONS.map((question) => ({
    id: question.id,
    quiz_id: question.quiz_id,
    question_text: question.question_text,
    options: question.options,
    xp_reward: question.xp_reward,
    coins_reward: question.coins_reward,
  }));
}

export async function submitDevLevelTest(
  answers: LevelTestAnswer[],
): Promise<LevelTestResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const breakdown = answers.map((answer) => {
    const question = DEV_LEVEL_QUESTIONS.find(
      (item) => item.id === answer.questionId,
    );

    const correct =
      question?.correct_option_index === answer.selectedOptionIndex;

    return {
      questionId: answer.questionId,
      correct: Boolean(correct),
      correctOptionIndex: question?.correct_option_index ?? 0,
    };
  });

  const score = breakdown.filter((item) => item.correct).length;
  const total = DEV_LEVEL_QUESTIONS.length;
  const { xpAwarded, coinsAwarded } = calcLevelTestRewards(score);

  return {
    score,
    total,
    title: resolveKnowledgeTitle(score, total),
    xpAwarded,
    coinsAwarded,
    breakdown,
  };
}
