export interface LetterForms {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface ArabicLetterFull {
  id: string;
  char: string;
  name: string;
  transliteration: string;
  speech: string;
  forms: LetterForms;
  connectsLeft: boolean;
}

export const ARABIC_ALPHABET_FULL: ArabicLetterFull[] = [
  { id: "alif", char: "ا", name: "Алиф", transliteration: "а / ā", speech: "ا", connectsLeft: false, forms: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" } },
  { id: "ba", char: "ب", name: "Ба", transliteration: "б", speech: "ب", connectsLeft: true, forms: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" } },
  { id: "ta", char: "ت", name: "Та", transliteration: "т", speech: "ت", connectsLeft: true, forms: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" } },
  { id: "tha", char: "ث", name: "Са", transliteration: "с (мягкое)", speech: "ث", connectsLeft: true, forms: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" } },
  { id: "jim", char: "ج", name: "Джим", transliteration: "дж", speech: "ج", connectsLeft: true, forms: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" } },
  { id: "ha", char: "ح", name: "Ха", transliteration: "х (гортанное)", speech: "ح", connectsLeft: true, forms: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" } },
  { id: "kha", char: "خ", name: "Хо", transliteration: "х", speech: "خ", connectsLeft: true, forms: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" } },
  { id: "dal", char: "د", name: "Даль", transliteration: "д", speech: "د", connectsLeft: false, forms: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" } },
  { id: "dhal", char: "ذ", name: "Заль", transliteration: "з", speech: "ذ", connectsLeft: false, forms: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" } },
  { id: "ra", char: "ر", name: "Ра", transliteration: "р", speech: "ر", connectsLeft: false, forms: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" } },
  { id: "zay", char: "ز", name: "Зай", transliteration: "з", speech: "ز", connectsLeft: false, forms: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" } },
  { id: "sin", char: "س", name: "Син", transliteration: "с", speech: "س", connectsLeft: true, forms: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" } },
  { id: "shin", char: "ش", name: "Шин", transliteration: "ш", speech: "ش", connectsLeft: true, forms: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" } },
  { id: "sad", char: "ص", name: "Сад", transliteration: "с (эмфатическое)", speech: "ص", connectsLeft: true, forms: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" } },
  { id: "dad", char: "ض", name: "Дад", transliteration: "д (эмфатическое)", speech: "ض", connectsLeft: true, forms: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" } },
  { id: "ta2", char: "ط", name: "Та (эмфат.)", transliteration: "т (твёрдое)", speech: "ط", connectsLeft: true, forms: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" } },
  { id: "za", char: "ظ", name: "За (эмфат.)", transliteration: "з (твёрдое)", speech: "ظ", connectsLeft: true, forms: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" } },
  { id: "ayn", char: "ع", name: "Айн", transliteration: "ъ (гортанное)", speech: "ع", connectsLeft: true, forms: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" } },
  { id: "ghayn", char: "غ", name: "Гайн", transliteration: "г (гортанное)", speech: "غ", connectsLeft: true, forms: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" } },
  { id: "fa", char: "ف", name: "Фа", transliteration: "ф", speech: "ف", connectsLeft: true, forms: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" } },
  { id: "qaf", char: "ق", name: "Каф", transliteration: "к (глубокое)", speech: "ق", connectsLeft: true, forms: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" } },
  { id: "kaf", char: "ك", name: "Каф (мягк.)", transliteration: "к", speech: "ك", connectsLeft: true, forms: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" } },
  { id: "lam", char: "ل", name: "Лям", transliteration: "л", speech: "ل", connectsLeft: true, forms: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" } },
  { id: "mim", char: "م", name: "Мим", transliteration: "м", speech: "م", connectsLeft: true, forms: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" } },
  { id: "nun", char: "ن", name: "Нун", transliteration: "н", speech: "ن", connectsLeft: true, forms: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" } },
  { id: "ha2", char: "ه", name: "Ха (мягк.)", transliteration: "х", speech: "ه", connectsLeft: true, forms: { isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" } },
  { id: "waw", char: "و", name: "Вав", transliteration: "у / в / ū", speech: "و", connectsLeft: false, forms: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" } },
  { id: "ya", char: "ي", name: "Йа", transliteration: "й / ī", speech: "ي", connectsLeft: true, forms: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" } },
];

/** @deprecated Use ARABIC_ALPHABET_FULL */
export interface ArabicLetter {
  char: string;
  name: string;
  transliteration: string;
  speech: string;
}

export const ARABIC_ALPHABET: ArabicLetter[] = ARABIC_ALPHABET_FULL.map(
  ({ char, name, transliteration, speech }) => ({
    char,
    name,
    transliteration,
    speech,
  }),
);

export { speakArabic, speakArabicLetter, primeArabicVoices } from "@/lib/arabic-audio";

export function pickGameOptions(correctIndex: number): ArabicLetter[] {
  const correct = ARABIC_ALPHABET[correctIndex];
  const pool = ARABIC_ALPHABET.filter((_, index) => index !== correctIndex);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [...shuffled.slice(0, 3), correct].sort(() => Math.random() - 0.5);
}
