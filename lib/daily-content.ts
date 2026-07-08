/**
 * «Аят дня» и «Хадис дня»: выбор детерминирован текущей датой (по Бишкеку),
 * поэтому в течение суток контент фиксирован, а в полночь меняется.
 */

import type { Hadith } from "@/lib/knowledge";

/** Всего аятов в Коране (сквозная нумерация alquran.cloud). */
const TOTAL_AYAHS = 6236;

const QURAN_API_BASE = "https://api.alquran.cloud/v1";
const AR_EDITION = "quran-uthmani";
const RU_EDITION = "ru.kuliev";

export interface DailyAyah {
  arabic: string;
  russian: string;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  numberInSurah: number;
}

/** Ключ текущего дня в часовом поясе Бишкека, например "2026-07-08". */
export function getBishkekDayKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bishkek",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Детерминированный хеш строки (FNV-1a), стабильный между сервером и клиентом. */
function hashString(input: string): number {
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

/** Стабильный индекс на сегодня: 0 <= index < modulo. */
export function getDailyIndex(salt: string, modulo: number): number {
  if (modulo <= 0) {
    return 0;
  }

  return hashString(`${getBishkekDayKey()}:${salt}`) % modulo;
}

interface ApiAyahEdition {
  text: string;
  numberInSurah: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
}

interface ApiEnvelope<T> {
  code: number;
  status: string;
  data: T;
}

export async function fetchDailyAyah(): Promise<DailyAyah> {
  const ayahNumber = getDailyIndex("ayah", TOTAL_AYAHS) + 1;

  const response = await fetch(
    `${QURAN_API_BASE}/ayah/${ayahNumber}/editions/${AR_EDITION},${RU_EDITION}`,
  );

  if (!response.ok) {
    throw new Error(`Quran API: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<ApiAyahEdition[]>;

  if (payload.code !== 200 || payload.data.length < 2) {
    throw new Error("Quran API: не удалось получить аят дня");
  }

  const [arabic, russian] = payload.data;

  return {
    arabic: arabic.text,
    russian: russian.text,
    surahNumber: arabic.surah.number,
    surahNameArabic: arabic.surah.name,
    surahNameEnglish: arabic.surah.englishName,
    numberInSurah: arabic.numberInSurah,
  };
}

/** Выбирает хадис дня из загруженного списка. */
export function pickDailyHadith(hadiths: Hadith[]): Hadith | null {
  if (hadiths.length === 0) {
    return null;
  }

  return hadiths[getDailyIndex("hadith", hadiths.length)];
}
