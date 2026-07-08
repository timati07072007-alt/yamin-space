/**
 * Интеграция с бесплатными API Корана:
 * - текст и метаданные: api.alquran.cloud (CORS открыт, без ключа)
 * - аудио сур (mp3, чтец Мишари Рашид аль-Афаси): server8.mp3quran.net
 */

import { latinToRussianTranscription } from "@/lib/transliteration";

const QURAN_API_BASE = "https://api.alquran.cloud/v1";
const AUDIO_BASE = "https://server8.mp3quran.net/afs";

/** Русский перевод Эльмира Кулиева. */
const RU_EDITION = "ru.kuliev";
/** Каноничный арабский текст (Усмани). */
const AR_EDITION = "quran-uthmani";
/** Латинская транслитерация — конвертируется в русскую транскрипцию. */
const TRANSLIT_EDITION = "en.transliteration";

export interface Surah {
  number: number;
  arabicName: string;
  englishName: string;
  translationName: string;
  ayahCount: number;
  revelationType: "Meccan" | "Medinan";
}

export interface SurahAyah {
  numberInSurah: number;
  arabic: string;
  /** Русская транскрипция произношения. */
  transcription: string;
  russian: string;
}

export interface SurahContent {
  surahNumber: number;
  ayahs: SurahAyah[];
}

interface ApiSurahRaw {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

interface ApiAyahRaw {
  numberInSurah: number;
  text: string;
}

interface ApiEnvelope<T> {
  code: number;
  status: string;
  data: T;
}

async function quranApi<T>(path: string): Promise<T> {
  const response = await fetch(`${QURAN_API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Quran API: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (payload.code !== 200) {
    throw new Error(`Quran API: ${payload.status}`);
  }

  return payload.data;
}

/** Прямая ссылка на mp3 суры (стриминг, полная сура одним файлом). */
export function getSurahAudioUrl(surahNumber: number): string {
  return `${AUDIO_BASE}/${String(surahNumber).padStart(3, "0")}.mp3`;
}

export async function fetchSurahList(): Promise<Surah[]> {
  const data = await quranApi<ApiSurahRaw[]>("/surah");

  return data.map((raw) => ({
    number: raw.number,
    arabicName: raw.name,
    englishName: raw.englishName,
    translationName: raw.englishNameTranslation,
    ayahCount: raw.numberOfAyahs,
    revelationType: raw.revelationType,
  }));
}

export async function fetchSurahContent(
  surahNumber: number,
): Promise<SurahContent> {
  const data = await quranApi<Array<{ ayahs: ApiAyahRaw[] }>>(
    `/surah/${surahNumber}/editions/${AR_EDITION},${TRANSLIT_EDITION},${RU_EDITION}`,
  );

  const [arabicEdition, translitEdition, russianEdition] = data;

  if (!arabicEdition || !translitEdition || !russianEdition) {
    throw new Error("Quran API: неполные данные изданий");
  }

  const ayahs: SurahAyah[] = arabicEdition.ayahs.map((ayah, index) => ({
    numberInSurah: ayah.numberInSurah,
    arabic: ayah.text,
    transcription: latinToRussianTranscription(
      translitEdition.ayahs[index]?.text ?? "",
    ),
    russian: russianEdition.ayahs[index]?.text ?? "",
  }));

  return { surahNumber, ayahs };
}
