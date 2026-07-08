import {
  ARABIC_ALPHABET,
  type ArabicLetter,
} from "@/lib/arabic-alphabet";

export type ArabicModuleId = "letters" | "vowels" | "tajweed" | "vocab";

export const ARABIC_MODULE_LABELS: Record<
  ArabicModuleId,
  { title: string; emoji: string; color: string; intro: string }
> = {
  letters: {
    title: "Буквы",
    emoji: "📖",
    color: "from-emerald-50 to-teal-50",
    intro: "Учим первые буквы арабского алфавита — с карточками и аудированием.",
  },
  vowels: {
    title: "Огласовки",
    emoji: "✨",
    color: "from-amber-50 to-orange-50",
    intro: "Фatha, касра и дамма — короткие гласные, которые меняют звук буквы.",
  },
  tajweed: {
    title: "Таджвид",
    emoji: "🕌",
    color: "from-violet-50 to-purple-50",
    intro: "Основы красивого чтения Корана: нун-сakin, мадд и правила остановки.",
  },
  vocab: {
    title: "Словарь",
    emoji: "💬",
    color: "from-sky-50 to-blue-50",
    intro: "Полезные слова из повседневной жизни мусульманина.",
  },
};

export type StepKind = "intro" | "flashcard" | "translate" | "listen" | "complete";

export interface LessonStep {
  id: string;
  kind: StepKind;
  title: string;
  letter?: ArabicLetter;
  options?: string[];
  correct?: string;
}

export interface VocabWord {
  ar: string;
  ru: string;
  tr: string;
}

export const ARABIC_VOCAB: VocabWord[] = [
  { ar: "كِتَاب", ru: "Книга", tr: "ки-таб" },
  { ar: "مَسْجِد", ru: "Мечеть", tr: "мас-джид" },
  { ar: "مَاء", ru: "Вода", tr: "маа" },
  { ar: "نُور", ru: "Свет", tr: "нур" },
  { ar: "سَلَام", ru: "Мир", tr: "са-лам" },
  { ar: "قُرْآن", ru: "Коран", tr: "ку-ран" },
  { ar: "صَلَاة", ru: "Намаз", tr: "са-лят" },
  { ar: "دُعَاء", ru: "Мольба", tr: "ду-а" },
];

export const VOWEL_MARKS: ArabicLetter[] = [
  { char: "بَ", name: "Ба с фathой (а)", transliteration: "ба", speech: "بَ" },
  { char: "بِ", name: "Ба с касрой (и)", transliteration: "би", speech: "بِ" },
  { char: "بُ", name: "Ба с даммой (у)", transliteration: "бу", speech: "بُ" },
  { char: "تَ", name: "Та с фathой", transliteration: "та", speech: "تَ" },
  { char: "تِ", name: "Та с касрой", transliteration: "ти", speech: "تِ" },
  { char: "تُ", name: "Та с даммой", transliteration: "ту", speech: "تُ" },
];

export const TAJWEED_ITEMS: ArabicLetter[] = [
  {
    char: "ن",
    name: "Нун сakin и танвин",
    transliteration: "правила идгам, ихкам, ихля",
    speech: "ن",
  },
  {
    char: "م",
    name: "Мим сakin",
    transliteration: "гунна — носовой звук",
    speech: "م",
  },
  {
    char: "ق",
    name: "Калька — остановка",
    transliteration: "пауза без дыхания",
    speech: "ق",
  },
  {
    char: "و",
    name: "Мадд — удлинение",
    transliteration: "удерживаем звук 2–6 счётов",
    speech: "و",
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function letterSteps(
  letters: ArabicLetter[],
  prefix: string,
): LessonStep[] {
  const steps: LessonStep[] = [];

  letters.forEach((letter, i) => {
    steps.push({
      id: `${prefix}-fc-${i}`,
      kind: "flashcard",
      title: letter.name,
      letter,
    });
    steps.push({
      id: `${prefix}-tr-${i}`,
      kind: "translate",
      title: "Выберите правильное название",
      letter,
      options: shuffle([
        letter.name,
        letters[(i + 1) % letters.length].name,
        letters[(i + 2) % letters.length].name,
        letters[(i + 3) % letters.length].name,
      ]),
      correct: letter.name,
    });
  });

  return steps;
}

function vocabSteps(words: VocabWord[]): LessonStep[] {
  return words.map((word, i) => ({
    id: `vocab-${i}`,
    kind: "listen" as const,
    title: "Как переводится это слово?",
    options: shuffle([
      word.ru,
      words[(i + 1) % words.length].ru,
      words[(i + 2) % words.length].ru,
      "Дом",
    ]),
    correct: word.ru,
    letter: {
      char: word.ar,
      name: word.ru,
      transliteration: word.tr,
      speech: word.ar,
    },
  }));
}

export function buildModuleSteps(module: ArabicModuleId): LessonStep[] {
  const meta = ARABIC_MODULE_LABELS[module];
  const steps: LessonStep[] = [
    { id: "intro", kind: "intro", title: meta.intro },
  ];

  switch (module) {
    case "letters":
      steps.push(...letterSteps(ARABIC_ALPHABET.slice(0, 8), "letters"));
      break;
    case "vowels":
      steps.push(...letterSteps(VOWEL_MARKS, "vowels"));
      break;
    case "tajweed":
      steps.push(...letterSteps(TAJWEED_ITEMS, "tajweed"));
      break;
    case "vocab":
      steps.push(...vocabSteps(ARABIC_VOCAB.slice(0, 6)));
      break;
  }

  steps.push({ id: "done", kind: "complete", title: "Урок завершён!" });
  return steps;
}
