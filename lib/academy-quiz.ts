import type { QuizQuestion, SubmitAnswerResult } from "@/lib/quiz";

export type AcademyDifficulty = "easy" | "medium" | "hardcore";

type DevQuestion = QuizQuestion & { correct_option_index: number };

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Ошибка запроса");
  }
  return payload;
}

export async function fetchAcademyQuestions(
  difficulty: AcademyDifficulty,
  limit = 20,
): Promise<QuizQuestion[]> {
  const response = await fetch(
    `/api/quiz/academy?difficulty=${difficulty}&limit=${limit}`,
  );
  const payload = await readJson<{ questions: QuizQuestion[] }>(response);
  return payload.questions;
}

export function shuffleQuestions<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const DEV_EASY: DevQuestion[] = [
  { id: 401, quiz_id: 4, question_text: "Сколько столпов Ислама?", options: ["Три", "Пять", "Семь", "Девять"], correct_option_index: 1, xp_reward: 10, coins_reward: 5 },
  { id: 402, quiz_id: 4, question_text: "Как называется ежедневная молитва?", options: ["Закят", "Саум", "Намаз", "Хадж"], correct_option_index: 2, xp_reward: 10, coins_reward: 5 },
  { id: 403, quiz_id: 4, question_text: "В каком месяце пост?", options: ["Шавваль", "Рамадан", "Раджаб", "Мухаррам"], correct_option_index: 1, xp_reward: 10, coins_reward: 5 },
  { id: 404, quiz_id: 4, question_text: "Как называется свидетельство веры?", options: ["Салят", "Шахада", "Закят", "Саум"], correct_option_index: 1, xp_reward: 10, coins_reward: 5 },
  { id: 405, quiz_id: 4, question_text: "Сколько сур в Коране?", options: ["100", "114", "120", "99"], correct_option_index: 1, xp_reward: 10, coins_reward: 5 },
  { id: 406, quiz_id: 4, question_text: "Как называется направление для молитвы?", options: ["Кибла", "Михраб", "Минбар", "Муаззин"], correct_option_index: 0, xp_reward: 10, coins_reward: 5 },
  { id: 407, quiz_id: 4, question_text: "Кто был последним Пророком?", options: ["Иса (а.с.)", "Муса (а.с.)", "Мухаммад ﷺ", "Ибрахим (а.с.)"], correct_option_index: 2, xp_reward: 10, coins_reward: 5 },
  { id: 408, quiz_id: 4, question_text: "Сколько раз в день обязательный намаз?", options: ["Три", "Четыре", "Пять", "Шесть"], correct_option_index: 2, xp_reward: 10, coins_reward: 5 },
];

const DEV_MEDIUM: DevQuestion[] = [
  { id: 501, quiz_id: 5, question_text: "Куда был перенесён Пророк ﷺ в ночь Исра?", options: ["Медина", "Иерусалим", "Мекка", "Тайф"], correct_option_index: 1, xp_reward: 15, coins_reward: 8 },
  { id: 502, quiz_id: 5, question_text: "Какая битва была первой?", options: ["Ухуд", "Бадр", "Оборона рва", "Хunayn"], correct_option_index: 1, xp_reward: 15, coins_reward: 8 },
  { id: 503, quiz_id: 5, question_text: "Кто был первым халифом?", options: ["Умар", "Уthman", "Абу Bakr", "Али"], correct_option_index: 2, xp_reward: 15, coins_reward: 8 },
  { id: 504, quiz_id: 5, question_text: "Кто первый муаззин?", options: ["Али", "Билал", "Умар", "Абу Bakr"], correct_option_index: 1, xp_reward: 15, coins_reward: 8 },
  { id: 505, quiz_id: 5, question_text: "Сколько аятов в al-Fatiha?", options: ["5", "6", "7", "8"], correct_option_index: 2, xp_reward: 15, coins_reward: 8 },
  { id: 506, quiz_id: 5, question_text: "Как называется миграция в Медину?", options: ["Хиджра", "Исра", "Хадж", "Умра"], correct_option_index: 0, xp_reward: 15, coins_reward: 8 },
  { id: 507, quiz_id: 5, question_text: "Кто была первая жена Пророка ﷺ?", options: ["Аиша", "Хadija", "Сawda", "Хafsa"], correct_option_index: 1, xp_reward: 15, coins_reward: 8 },
  { id: 508, quiz_id: 5, question_text: "Кто был «вторым в пещере»?", options: ["Али", "Абу Bakr", "Умар", "Хamza"], correct_option_index: 1, xp_reward: 15, coins_reward: 8 },
];

const DEV_HARDCORE: DevQuestion[] = [
  { id: 601, quiz_id: 6, question_text: "Сколько аятов в al-Baqara?", options: ["200", "255", "286", "300"], correct_option_index: 2, xp_reward: 25, coins_reward: 12 },
  { id: 602, quiz_id: 6, question_text: "Кто составил «Muwatta»?", options: ["Malik ibn Anas", "Al-Bukhari", "Muslim", "Ahmad ibn Hanbal"], correct_option_index: 0, xp_reward: 25, coins_reward: 12 },
  { id: 603, quiz_id: 6, question_text: "Сколько juz в Коране?", options: ["20", "30", "40", "114"], correct_option_index: 1, xp_reward: 25, coins_reward: 12 },
  { id: 604, quiz_id: 6, question_text: "Кто был «As-Siddiq»?", options: ["Умар", "Абу Bakr", "Али", "Уthman"], correct_option_index: 1, xp_reward: 25, coins_reward: 12 },
  { id: 605, quiz_id: 6, question_text: "В каком году был завоёван Мекka?", options: ["6 AH", "8 AH", "10 AH", "2 AH"], correct_option_index: 1, xp_reward: 25, coins_reward: 12 },
  { id: 606, quiz_id: 6, question_text: "Кто составил «Riyadh as-Salihin»?", options: ["An-Nawawi", "Al-Bukhari", "Ibn Majah", "Ad-Daraqutni"], correct_option_index: 0, xp_reward: 25, coins_reward: 12 },
  { id: 607, quiz_id: 6, question_text: "Какой месяц начинает исламский календарь?", options: ["Ramadan", "Muharram", "Rajab", "Shawwal"], correct_option_index: 1, xp_reward: 25, coins_reward: 12 },
  { id: 608, quiz_id: 6, question_text: "Сколько лет Пророк ﷺ пророчествовал?", options: ["10", "13", "23", "40"], correct_option_index: 2, xp_reward: 25, coins_reward: 12 },
];

const DEV_BY_DIFFICULTY: Record<AcademyDifficulty, DevQuestion[]> = {
  easy: DEV_EASY,
  medium: DEV_MEDIUM,
  hardcore: DEV_HARDCORE,
};

const DEV_ALL = [...DEV_EASY, ...DEV_MEDIUM, ...DEV_HARDCORE];

export async function fetchDevAcademyQuestions(
  difficulty: AcademyDifficulty,
  limit = 20,
): Promise<QuizQuestion[]> {
  await new Promise((r) => setTimeout(r, 200));
  return shuffleQuestions(DEV_BY_DIFFICULTY[difficulty]).slice(0, limit).map(stripCorrect);
}

function stripCorrect(q: DevQuestion): QuizQuestion {
  return {
    id: q.id,
    quiz_id: q.quiz_id,
    question_text: q.question_text,
    options: q.options,
    xp_reward: q.xp_reward,
    coins_reward: q.coins_reward,
  };
}

export async function submitDevAcademyAnswer(
  questionId: number,
  selectedOptionIndex: number,
): Promise<SubmitAnswerResult> {
  await new Promise((r) => setTimeout(r, 200));
  const question = DEV_ALL.find((q) => q.id === questionId);
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
