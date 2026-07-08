export type QuizDifficulty = "easy" | "medium" | "hard";

export interface Quiz {
  id: number;
  title: string;
  category: string;
  difficulty: QuizDifficulty;
}

/** Вопрос без правильного ответа — его знает только сервер. */
export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  options: string[];
  xp_reward: number;
  coins_reward: number;
}

export interface SubmitAnswerResult {
  correct: boolean;
  correctOptionIndex: number;
  xpAwarded: number;
  coinsAwarded: number;
  alreadyAnswered: boolean;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Ошибка запроса к серверу");
  }

  return payload;
}

export async function fetchQuizzes(): Promise<Quiz[]> {
  const response = await fetch("/api/quiz");
  const payload = await readJson<{ quizzes: Quiz[] }>(response);
  return payload.quizzes;
}

export async function fetchQuizQuestions(
  quizId: number,
): Promise<QuizQuestion[]> {
  const response = await fetch(`/api/quiz/${quizId}/questions`);
  const payload = await readJson<{ questions: QuizQuestion[] }>(response);
  return payload.questions;
}

export async function submitQuizAnswer(
  userId: number,
  questionId: number,
  selectedOptionIndex: number,
): Promise<SubmitAnswerResult> {
  const response = await fetch("/api/quiz/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, questionId, selectedOptionIndex }),
  });

  return readJson<SubmitAnswerResult>(response);
}

// ---------------------------------------------------------------------------
// DEV-режим: мок-данные для тестирования UI в браузере без Telegram и Supabase
// ---------------------------------------------------------------------------

export const DEV_QUIZZES: Quiz[] = [
  { id: 1, title: "Основы Ислама", category: "Акыда", difficulty: "easy" },
  { id: 2, title: "История Пророков", category: "Сира", difficulty: "medium" },
];

interface DevQuestion extends QuizQuestion {
  correct_option_index: number;
}

const DEV_QUESTIONS: DevQuestion[] = [
  {
    id: 101,
    quiz_id: 1,
    question_text: "Сколько столпов Ислама?",
    options: ["Три", "Пять", "Семь", "Девять"],
    correct_option_index: 1,
    xp_reward: 10,
    coins_reward: 5,
  },
  {
    id: 102,
    quiz_id: 1,
    question_text: "Как называется ежедневная пятикратная молитва?",
    options: ["Закят", "Саум", "Намаз", "Хадж"],
    correct_option_index: 2,
    xp_reward: 10,
    coins_reward: 5,
  },
  {
    id: 103,
    quiz_id: 1,
    question_text: "В каком месяце мусульмане соблюдают пост?",
    options: ["Шавваль", "Рамадан", "Раджаб", "Мухаррам"],
    correct_option_index: 1,
    xp_reward: 10,
    coins_reward: 5,
  },
  {
    id: 201,
    quiz_id: 2,
    question_text: "Кто был первым Пророком?",
    options: ["Нух (а.с.)", "Ибрахим (а.с.)", "Адам (а.с.)", "Муса (а.с.)"],
    correct_option_index: 2,
    xp_reward: 15,
    coins_reward: 8,
  },
  {
    id: 202,
    quiz_id: 2,
    question_text: "Какой Пророк построил ковчег?",
    options: ["Нух (а.с.)", "Юнус (а.с.)", "Юсуф (а.с.)", "Иса (а.с.)"],
    correct_option_index: 0,
    xp_reward: 15,
    coins_reward: 8,
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchDevQuizQuestions(
  quizId: number,
): Promise<QuizQuestion[]> {
  await delay(300);

  return DEV_QUESTIONS.filter((question) => question.quiz_id === quizId).map(
    (question) => ({
      id: question.id,
      quiz_id: question.quiz_id,
      question_text: question.question_text,
      options: question.options,
      xp_reward: question.xp_reward,
      coins_reward: question.coins_reward,
    }),
  );
}

export async function submitDevQuizAnswer(
  questionId: number,
  selectedOptionIndex: number,
): Promise<SubmitAnswerResult> {
  await delay(400);

  const question = DEV_QUESTIONS.find((item) => item.id === questionId);

  if (!question) {
    throw new Error("Вопрос не найден");
  }

  const correct = question.correct_option_index === selectedOptionIndex;

  return {
    correct,
    correctOptionIndex: question.correct_option_index,
    xpAwarded: correct ? question.xp_reward : 0,
    coinsAwarded: correct ? question.coins_reward : 0,
    alreadyAnswered: false,
  };
}
