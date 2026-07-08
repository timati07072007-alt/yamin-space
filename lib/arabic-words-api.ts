export interface ArabicWord {
  id: number;
  arabic: string;
  transliteration: string;
  translation_ru: string;
  audio_url: string | null;
  category: string;
  difficulty: number;
  word_frequency: number;
}

export interface ArabicWordsResponse {
  words: ArabicWord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WordProgress {
  word_id: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  last_result: string | null;
  xp_earned: number;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Ошибка запроса");
  return payload;
}

export async function fetchArabicWords(params: {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<ArabicWordsResponse> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.category && params.category !== "Все") q.set("category", params.category);
  q.set("page", String(params.page ?? 1));
  q.set("pageSize", String(params.pageSize ?? 30));

  const response = await fetch(`/api/arabic/words?${q}`);
  return readJson(response);
}

export async function fetchLearnBatch(userId: number, limit = 10): Promise<ArabicWord[]> {
  const response = await fetch(
    `/api/arabic/words?mode=learn&userId=${userId}&limit=${limit}`,
  );
  const payload = await readJson<{ words: ArabicWord[] }>(response);
  return payload.words;
}

export async function submitWordProgress(payload: {
  userId: number;
  wordId: number;
  result: "again" | "hard" | "good" | "easy";
}): Promise<{ xp: number }> {
  const response = await fetch("/api/arabic/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson(response);
}
