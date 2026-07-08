export type AdhkarCategory =
  | "morning"
  | "evening"
  | "after_prayer"
  | "general";

export interface AdhkarItem {
  id: string;
  category: AdhkarCategory;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  repeat?: number;
}

export const ADHKAR_CATEGORY_LABELS: Record<AdhkarCategory, string> = {
  morning: "Утренние",
  evening: "Вечерние",
  after_prayer: "После намаза",
  general: "Общие",
};

export const ADHKAR_ITEMS: AdhkarItem[] = [
  {
    id: "morning-1",
    category: "morning",
    title: "Аят аль-Kursi (начало дня)",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    transliteration: "Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum",
    translation:
      "Аллаh — нет божества, кроме Него, Живого, Сущего. (начало аята al-Kursi)",
    repeat: 1,
  },
  {
    id: "morning-2",
    category: "morning",
    title: "Сура al-Ikhlas, al-Falaq, an-Nas",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    transliteration: "Qul Huwa Allahu Ahad",
    translation: "Скажи: Он — Аллаh, Един.",
    repeat: 3,
  },
  {
    id: "morning-3",
    category: "morning",
    title: "СубhanAllah wa bihamdihi",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    translation: "Пречист Аллаh и Ему хвала.",
    repeat: 100,
  },
  {
    id: "evening-1",
    category: "evening",
    title: "Амсaa (вечернее поминание)",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
    transliteration: "Amsayna wa amsal-mulku lillah",
    translation:
      "Мы встретили вечер, и вся власть принадлежит Аллаhу.",
    repeat: 1,
  },
  {
    id: "evening-2",
    category: "evening",
    title: "А'узу bi kalimatillah",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi kalimatillahi at-tammati min sharri ma khalaq",
    translation:
      "Прибегаю к совершенным словам Аллаhа от зла Его творений.",
    repeat: 3,
  },
  {
    id: "evening-3",
    category: "evening",
    title: "La ilaha illa Huwa",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah",
    translation:
      "Нет божества, кроме Аллаhа, One, без сотоварища.",
    repeat: 1,
  },
  {
    id: "prayer-1",
    category: "after_prayer",
    title: "Астагfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translation: "Прошу прощения у Аллаhа.",
    repeat: 3,
  },
  {
    id: "prayer-2",
    category: "after_prayer",
    title: "Аllahumma antas-Salam",
    arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ",
    transliteration: "Allahumma antas-Salamu wa minkas-Salam",
    translation: "О Аллаh, Ты — Мир, и от Тебя — мир.",
    repeat: 1,
  },
  {
    id: "prayer-3",
    category: "after_prayer",
    title: "SubhanAllah, al-Hamdulillah, Allahu Akbar",
    arabic: "سُبْحَانَ اللَّهِ، الْحَمْدُ لِلَّهِ، اللَّهُ أَكْبَرُ",
    transliteration: "SubhanAllah, Alhamdulillah, Allahu Akbar",
    translation: "Пречист Аллаh, хвала Аллаhу, Аллаh Велик.",
    repeat: 33,
  },
  {
    id: "general-1",
    category: "general",
    title: "Дуа тревоги",
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa Anta, Subhanaka, inni kuntu minaz-zalimin",
    translation:
      "Нет божества, кроме Тебя! Пречист Ты! Поистине, я был из числа несправедливых.",
    repeat: 1,
  },
  {
    id: "general-2",
    category: "general",
    title: "Дуa перед едой",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "Во имя Аллаhа.",
    repeat: 1,
  },
  {
    id: "general-3",
    category: "general",
    title: "Дуa после еды",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا",
    transliteration: "Alhamdulillahil-ladhi at'amani hadha",
    translation: "Хвала Аллаhу, который накормил меня этим.",
    repeat: 1,
  },
  {
    id: "general-4",
    category: "general",
    title: "Дуa входа в дом",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا",
    transliteration: "Bismillahi walajna, wa bismillahi kharajna",
    translation:
      "Во имя Аллаhа мы вошли, и во имя Аллаhа мы вышли.",
    repeat: 1,
  },
  {
    id: "general-5",
    category: "general",
    title: "Дуa выхода из дома",
    arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ",
    transliteration: "Bismillah, tawakkaltu 'alallah",
    translation: "Во имя Аллаhа, я уповаю на Аллаhа.",
    repeat: 1,
  },
];

export const TASBIH_PRESETS = [
  { id: "subhan", label: "СубhanAllah", arabic: "سُبْحَانَ اللَّهِ", target: 33 },
  { id: "hamd", label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", target: 33 },
  { id: "akbar", label: "Allahu Akbar", arabic: "الَّلهُ أَكْبَرُ", target: 34 },
  { id: "salat", label: "Salawat", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100 },
] as const;

export type TasbihPresetId = (typeof TASBIH_PRESETS)[number]["id"];
