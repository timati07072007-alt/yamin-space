/**
 * Arabic audio playback with preferred female voice selection.
 * Uses Web Speech API with ar-SA + female voice heuristics.
 */

let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const FEMALE_HINTS = [
  "female",
  "hoda",
  "zira",
  "salma",
  "amira",
  "layla",
  "laila",
  "fatima",
  "mariam",
  "noura",
];

const MALE_HINTS = [
  "male",
  "naayf",
  "majed",
  "maged",
  "tarik",
  "omar",
  "youssef",
  "meed",
  "rauf",
  "hamza",
];

const PREFERRED_LANGS = ["ar-sa", "ar-eg", "ar-ae", "ar-xa", "ar"];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/** Wait until the browser exposes speech voices (critical on iOS / Telegram WebView). */
export function waitForArabicVoices(timeoutMs = 1800): Promise<SpeechSynthesisVoice[]> {
  if (voicesReadyPromise) {
    return voicesReadyPromise;
  }

  voicesReadyPromise = new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }

    const synth = window.speechSynthesis;

    const finish = () => {
      const voices = synth.getVoices();
      resolve(voices);
    };

    const tryPick = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        finish();
        return true;
      }
      return false;
    };

    if (tryPick()) {
      return;
    }

    const onChange = () => {
      if (tryPick()) {
        synth.removeEventListener("voiceschanged", onChange);
      }
    };

    synth.addEventListener("voiceschanged", onChange);
    synth.getVoices();

    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", onChange);
      finish();
    }, timeoutMs);
  });

  return voicesReadyPromise;
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  let score = 0;
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();

  if (MALE_HINTS.some((hint) => name.includes(hint))) score -= 100;
  if (FEMALE_HINTS.some((hint) => name.includes(hint))) score += 80;

  if (name.includes("google") && name.includes("arab")) score += 40;
  if (name.includes("microsoft") && (name.includes("hoda") || name.includes("zira"))) {
    score += 45;
  }
  if (name.includes("premium") || name.includes("natural") || name.includes("neural")) {
    score += 30;
  }

  const langRank = PREFERRED_LANGS.indexOf(lang);
  if (langRank >= 0) score += 20 - langRank * 2;

  if (!v.localService) score += 8;

  return score;
}

/** Pick the best available Arabic female voice (re-evaluated each call). */
export function pickArabicVoice(
  voices: SpeechSynthesisVoice[] = loadVoices(),
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const arabic = voices.filter((v) => v.lang.toLowerCase().startsWith("ar"));
  if (arabic.length === 0) return null;

  const femaleOnly = arabic.filter((v) =>
    FEMALE_HINTS.some((hint) => v.name.toLowerCase().includes(hint)),
  );

  const nonMale = arabic.filter(
    (v) => !MALE_HINTS.some((hint) => v.name.toLowerCase().includes(hint)),
  );

  const pool = femaleOnly.length > 0 ? femaleOnly : nonMale.length > 0 ? nonMale : arabic;

  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null;
}

export function primeArabicVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  void waitForArabicVoices().then((voices) => {
    pickArabicVoice(voices);
  });

  window.speechSynthesis.onvoiceschanged = () => {
    voicesReadyPromise = null;
    void waitForArabicVoices();
  };
}

let currentAudio: HTMLAudioElement | null = null;

function isTrustedRecordedAudio(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.pathname.includes("/storage/v1/object/public/arabic-audio/") &&
      /\.(mp3|ogg|wav|m4a)(\?|$)/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export async function playArabicAudio(
  text: string,
  audioUrl?: string | null,
): Promise<void> {
  // Prefer Web Speech with female voice — seed audio URLs are often missing or robotic.
  try {
    await speakArabic(text);
    return;
  } catch {
    // fall through to recorded audio
  }

  if (audioUrl && isTrustedRecordedAudio(audioUrl)) {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      await audio.play();
    } catch {
      await speakArabic(text);
    }
  }
}

export function speakArabic(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    void waitForArabicVoices().then((voices) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.78;
      utterance.pitch = 1.14;
      utterance.volume = 1;

      const voice = pickArabicVoice(voices);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "ar-SA";
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  });
}

export function speakArabicLetter(speech: string): void {
  void speakArabic(speech);
}
