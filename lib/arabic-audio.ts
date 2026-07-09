/**
 * Arabic audio playback with preferred female voice selection.
 * Priority: Supabase audio_url -> Web Speech (best female ar voice).
 */

let voicesCache: SpeechSynthesisVoice[] | null = null;
let preferredVoice: SpeechSynthesisVoice | null = null;
let voicesReady = false;

const FEMALE_HINTS = [
  "female",
  "hoda",
  "zira",
  "salma",
  "amira",
  "layla",
  "laila",
];

const MALE_HINTS = ["male", "naayf", "majed", "tarik", "omar", "youssef", "meed", "rauf"];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  voicesCache = window.speechSynthesis.getVoices();
  if (voicesCache.length > 0) {
    voicesReady = true;
  }
  return voicesCache;
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  let score = 0;
  const name = v.name.toLowerCase();

  if (MALE_HINTS.some((hint) => name.includes(hint))) score -= 40;
  if (FEMALE_HINTS.some((hint) => name.includes(hint))) score += 35;

  if (name.includes("google") && name.includes("arab")) score += 28;
  if (name.includes("microsoft") && (name.includes("hoda") || name.includes("zira"))) {
    score += 32;
  }
  if (name.includes("premium") || name.includes("natural") || name.includes("neural")) {
    score += 24;
  }
  if (v.lang === "ar-SA" || v.lang === "ar-EG" || v.lang === "ar-AE") score += 12;
  if (!v.localService) score += 6;

  return score;
}

/** Prefer natural-sounding Arabic female voices when available. */
export function pickArabicVoice(): SpeechSynthesisVoice | null {
  if (preferredVoice) return preferredVoice;

  const voices = loadVoices();
  if (voices.length === 0) return null;

  const ranked = voices
    .filter((v) => v.lang.toLowerCase().startsWith("ar"))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));

  preferredVoice =
    ranked[0] ?? voices.find((v) => v.lang.toLowerCase().startsWith("ar")) ?? null;
  return preferredVoice;
}

export function primeArabicVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  loadVoices();
  pickArabicVoice();

  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = null;
    preferredVoice = null;
    voicesReady = false;
    loadVoices();
    pickArabicVoice();
    voicesReady = true;
  };

  window.setTimeout(() => {
    if (!voicesReady) {
      loadVoices();
      pickArabicVoice();
    }
  }, 250);
}

let currentAudio: HTMLAudioElement | null = null;

export async function playArabicAudio(
  text: string,
  audioUrl?: string | null,
): Promise<void> {
  if (audioUrl) {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      await audio.play();
      return;
    } catch {
      // fallback to TTS
    }
  }
  await speakArabic(text);
}

export function speakArabic(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const run = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.72;
      utterance.pitch = 1.12;
      utterance.volume = 1;

      const voice = pickArabicVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    };

    if (!voicesReady) {
      loadVoices();
      pickArabicVoice();
      window.setTimeout(run, 80);
      return;
    }

    run();
  });
}

export function speakArabicLetter(speech: string): void {
  void speakArabic(speech);
}
