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

export interface TasbihPreset {
  id: string;
  label: string;
  arabic: string;
  transliteration: string;
  target: number;
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
    title: "Аят аль-Курси (начало)",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    transliteration:
      "Ал-ла-hу ля и-ля-hа ил-ля Hu-ва, аль-Hай-юль-Kай-yum. Ля та-ху-зу-hу си-натун wa ля на-um",
    translation:
      "Аллаh — нет божества, кроме Него, Живого, Сущего. Его не берёт ни дремота, ни сон.",
    repeat: 1,
  },
  {
    id: "morning-2",
    category: "morning",
    title: "Суры «Ихлас», «Фаляк», «Нас»",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ",
    transliteration: "Куль Hu-ва Ал-ла-hу А-hад. Ал-ла-hу-с-самад",
    translation: "Скажи: Он — Аллаh, Един. Аллаh — Самодостаточный.",
    repeat: 3,
  },
  {
    id: "morning-3",
    category: "morning",
    title: "Пречист Аллаh и Ему хвала",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Суб-hа-на-л-ла-hи wa би-hам-ди-hи",
    translation: "Пречист Аллаh и Ему хвала.",
    repeat: 100,
  },
  {
    id: "morning-4",
    category: "morning",
    title: "Утреннее поминание",
    arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ",
    transliteration:
      "Ас-бah-на wa ас-bah-аль-мул-ку лil-ляh, wal-hам-ду lil-ляh",
    translation:
      "Мы встретили утро, и всей властью обладает Аллаh. Хвала Аллаhу.",
    repeat: 1,
  },
  {
    id: "evening-1",
    category: "evening",
    title: "Вечернее поминание",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ",
    transliteration:
      "Ам-сай-на wa ам-са-ль-мул-ку лil-ляh, wal-hам-ду lil-ляh",
    translation:
      "Мы встретили вечер, и всей властью обладает Аллаh. Хвала Аллаhу.",
    repeat: 1,
  },
  {
    id: "evening-2",
    category: "evening",
    title: "Прибегаю к словам Аллаhа",
    arabic:
      "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration:
      "А'у-зу би ка-ли-ма-ти-л-ля-hи-т-та-м-ма-ти мин шар-ри ма hа-ляк",
    translation:
      "Прибегаю к совершенным словам Аллаhа от зла всего, что Он создал.",
    repeat: 3,
  },
  {
    id: "evening-3",
    category: "evening",
    title: "Нет божества, кроме Аллаhа",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ",
    transliteration:
      "Ля и-ля-hа ил-ля-л-ла-hу wa-hда-hу ля ша-ри-ка лah, лah-уль-мул-ку wa лah-уль-hам-ду",
    translation:
      "Нет божества, кроме Аллаhа, One, без сотоварища. Ему принадлежит власть и хвала.",
    repeat: 1,
  },
  {
    id: "prayer-1",
    category: "after_prayer",
    title: "Прошу прощения у Аллаhа",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Ас-таг-фи-ру-л-ляh",
    translation: "Прошу прощения у Аллаhа.",
    repeat: 3,
  },
  {
    id: "prayer-2",
    category: "after_prayer",
    title: "О Аллаh, Ты — Мир",
    arabic:
      "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration:
      "Ал-ла-hум-ма ан-та-с-сал-я-m wa мин-ка-с-сал-я-m, та-ба-рак-та я зal-джа-ля-li wal-ик-рам",
    translation:
      "О Аллаh, Ты — Мир, и от Тебя — мир. Благословен Ты, о Обладатель величия и почёта!",
    repeat: 1,
  },
  {
    id: "prayer-3",
    category: "after_prayer",
    title: "Три поминания после намаза",
    arabic: "سُبْحَانَ اللَّهِ، الْحَمْدُ لِلَّهِ، اللَّهُ أَكْبَرُ",
    transliteration: "Суб-hа-на-л-ла-h, аль-Hам-ду lil-ляh, Ал-ла-hу Ак-бар",
    translation: "Пречист Аллаh. Хвала Аллаhу. Аллаh Велик.",
    repeat: 33,
  },
  {
    id: "prayer-4",
    category: "after_prayer",
    title: "Единый поминание (тамм)",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "Ля и-ля-hа ил-ля-л-ла-hу wa-hда-hу ля ша-ри-ка лah, лah-уль-мул-ку wa лah-уль-hам-ду wa Hu-ва 'аля кул-ли шай-ин ка-ди-р",
    translation:
      "Нет божества, кроме Аллаhа, One, без сотоварища. Ему власть и хвала, и Он способен на всё.",
    repeat: 1,
  },
  {
    id: "prayer-5",
    category: "after_prayer",
    title: "Сalawat на Пророка ﷺ",
    arabic:
      "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ",
    transliteration:
      "Ал-ла-hум-ма сал-ли 'аля Mu-hам-ма-дин wa 'аля а-ли Mu-hам-ма-дин",
    translation: "О Аллаh, благослови Мухаммада и его семью.",
    repeat: 10,
  },
  {
    id: "general-1",
    category: "general",
    title: "Дуа в тревоге (дуа Юнуса)",
    arabic:
      "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration:
      "Ля и-ля-hа ил-ля Ан-та, Суб-hа-на-ка, ин-ни кун-ту мин-az-зa-ли-мин",
    translation:
      "Нет божества, кроме Тебя! Пречист Ты! Поистине, я был из числа несправедливых.",
    repeat: 1,
  },
  {
    id: "general-2",
    category: "general",
    title: "Дуа из Корана: «Господь наш!»",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration:
      "Раб-ба-на а-ти-на фид-ду-нья hа-са-натан wa fil-а-хи-ра-ти hа-са-натан wa ки-на 'а-за-бан-нар",
    translation:
      "Господь наш! Дай нам благо в этом мире и благо в Последней жизни, и защити нас от наказания Огнём.",
    repeat: 1,
  },
  {
    id: "general-3",
    category: "general",
    title: "Дуа перед едой",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Бис-мil-ляh",
    translation: "Во имя Аллаhа.",
    repeat: 1,
  },
  {
    id: "general-4",
    category: "general",
    title: "Дуа после еды",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration:
      "Аль-Hам-ду lil-ля-hil-ла-зи ат-'а-ма-ни hа-за wa ра-за-qa-ни-hи мин гай-ри hа-wлин мин-ни wa ля quw-wа",
    translation:
      "Хвала Аллаhу, который накормил меня этим и дал мне пропитание без силы и мощи с моей стороны.",
    repeat: 1,
  },
  {
    id: "general-5",
    category: "general",
    title: "Дуа входа в дом",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا",
    transliteration: "Бис-mil-ля-hи wa-ладж-на, wa бис-mil-ля-hи hа-радж-на",
    translation: "Во имя Аллаhа мы вошли, и во имя Аллаhа мы вышли.",
    repeat: 1,
  },
  {
    id: "general-6",
    category: "general",
    title: "Дуа выхода из дома",
    arabic:
      "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration:
      "Бис-mil-ляh, та-wak-кal-ту 'алal-ляh, wa ля hа-wla wa ля quw-wа-та ил-ля bil-ляh",
    translation:
      "Во имя Аллаhа, я уповаю на Аллаhа. Нет силы и мощи, кроме как у Аллаhа.",
    repeat: 1,
  },
  {
    id: "general-7",
    category: "general",
    title: "Дуа перед сном",
    arabic:
      "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Бис-ми-ка Ал-ла-hум-ма а-му-ту wa а-hйa",
    translation: "С Твоим именем, о Аллаh, я умираю и оживаю.",
    repeat: 1,
  },
];

export const TASBIH_PRESETS: TasbihPreset[] = [
  {
    id: "subhan",
    label: "Пречист Аллаh",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Суб-hа-на-л-ла-h",
    target: 33,
  },
  {
    id: "hamd",
    label: "Хвала Аллаhу",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Аль-Hам-ду lil-ляh",
    target: 33,
  },
  {
    id: "akbar",
    label: "Аллаh Велик",
    arabic: "الَّلهُ أَكْبَرُ",
    transliteration: "Ал-ла-hу Ак-бар",
    target: 34,
  },
  {
    id: "salat",
    label: "Молитва о Пророке ﷺ",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    transliteration: "Ал-ла-hум-ма сал-ли 'аля Mu-hам-ма-дин",
    target: 100,
  },
];

export type TasbihPresetId = (typeof TASBIH_PRESETS)[number]["id"];

export interface DhikrTarget {
  id: string;
  label: string;
  arabic: string;
  transliteration: string;
  target: number;
  isCustom?: boolean;
}

export function presetToTarget(p: TasbihPreset): DhikrTarget {
  return {
    id: p.id,
    label: p.label,
    arabic: p.arabic,
    transliteration: p.transliteration,
    target: p.target,
  };
}

export function customToTarget(
  c: { id: number; title: string; transliteration: string; target_count: number },
): DhikrTarget {
  return {
    id: `custom-${c.id}`,
    label: c.title,
    arabic: "",
    transliteration: c.transliteration,
    target: c.target_count,
    isCustom: true,
  };
}
