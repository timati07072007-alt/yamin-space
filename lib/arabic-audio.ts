/**
 * Arabic audio playback with preferred voice selection.
 * Priority: Supabase audio_url -> cached blob -> Web Speech (best female ar voice).
 */

let voicesCache: SpeechSynthesisVoice[] | null = null;
let preferredVoice: SpeechSynthesisVoice | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  voicesCache = window.speechSynthesis.getVoices();
  return voicesCache;
}

/** Prefer natural-sounding Arabic female voices when available. */
export function pickArabicVoice(): SpeechSynthesisVoice | null {
  if (preferredVoice) return preferredVoice;
  const voices = loadVoices();
  if (voices.length === 0) return null;

  const ranked = voices
    .filter((v) => v.lang.startsWith("ar"))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));

  preferredVoice = ranked[0] ?? voices.find((v) => v.lang.startsWith("ar")) ?? null;
  return preferredVoice;
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  let score = 0;
  const name = v.name.toLowerCase();
  if (name.includes("female") || name.includes("zira") || name.includes("hoda")) score += 30;
  if (name.includes("google")) score += 20;
  if (name.includes("microsoft")) score += 15;
  if (name.includes("premium") || name.includes("natural")) score += 25;
  if (v.lang === "ar-SA" || v.lang === "ar-EG") score += 10;
  if (!v.localService) score += 5;
  return score;
}

export function primeArabicVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = null;
    preferredVoice = null;
    pickArabicVoice();
  };
  pickArabicVoice();
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
  speakArabic(text);
}

export function speakArabic(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  utterance.rate = 0.78;
  utterance.pitch = 1.05;

  const voice = pickArabicVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function speakArabicLetter(speech: string): void {
  speakArabic(speech);
}
