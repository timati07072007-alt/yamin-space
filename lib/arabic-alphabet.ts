export interface ArabicLetter {
  char: string;
  name: string;
  transliteration: string;
  /** Произношение для Web Speech API (арабская буква). */
  speech: string;
}

export const ARABIC_ALPHABET: ArabicLetter[] = [
  { char: "ا", name: "Алиф", transliteration: "а", speech: "ا" },
  { char: "ب", name: "Ба", transliteration: "б", speech: "ب" },
  { char: "ت", name: "Та", transliteration: "т", speech: "ت" },
  { char: "ث", name: "Са", transliteration: "с", speech: "ث" },
  { char: "ج", name: "Джим", transliteration: "дж", speech: "ج" },
  { char: "ح", name: "Ха", transliteration: "х", speech: "ح" },
  { char: "خ", name: "Хо", transliteration: "х", speech: "خ" },
  { char: "د", name: "Даль", transliteration: "д", speech: "د" },
  { char: "ذ", name: "Заль", transliteration: "з", speech: "ذ" },
  { char: "ر", name: "Ра", transliteration: "р", speech: "ر" },
  { char: "ز", name: "Зай", transliteration: "з", speech: "ز" },
  { char: "س", name: "Син", transliteration: "с", speech: "س" },
  { char: "ش", name: "Шин", transliteration: "ш", speech: "ش" },
  { char: "ص", name: "Сад", transliteration: "с", speech: "ص" },
  { char: "ض", name: "Дад", transliteration: "д", speech: "ض" },
  { char: "ط", name: "Та", transliteration: "т", speech: "ط" },
  { char: "ظ", name: "За", transliteration: "з", speech: "ظ" },
  { char: "ع", name: "Айн", transliteration: "ъ", speech: "ع" },
  { char: "غ", name: "Гайн", transliteration: "г", speech: "غ" },
  { char: "ف", name: "Фа", transliteration: "ф", speech: "ف" },
  { char: "ق", name: "Каф", transliteration: "к", speech: "ق" },
  { char: "ك", name: "Каф", transliteration: "к", speech: "ك" },
  { char: "ل", name: "Лям", transliteration: "л", speech: "ل" },
  { char: "م", name: "Мим", transliteration: "м", speech: "م" },
  { char: "ن", name: "Нун", transliteration: "н", speech: "ن" },
  { char: "ه", name: "Ха", transliteration: "х", speech: "ه" },
  { char: "و", name: "Вав", transliteration: "у/в", speech: "و" },
  { char: "ي", name: "Йа", transliteration: "й", speech: "ي" },
];

export function speakArabicLetter(speech: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(speech);
  utterance.lang = "ar-SA";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export function pickGameOptions(correctIndex: number): ArabicLetter[] {
  const correct = ARABIC_ALPHABET[correctIndex];
  const pool = ARABIC_ALPHABET.filter((_, index) => index !== correctIndex);

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3);
  const options = [...distractors, correct].sort(() => Math.random() - 0.5);

  return options;
}
