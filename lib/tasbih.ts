export interface TasbihPreset {
  id: string;
  label: string;
  meaning: string;
  arabic: string;
  transliteration: string;
  target: number;
}

export interface DhikrTarget {
  id: string;
  label: string;
  meaning?: string;
  arabic: string;
  transliteration: string;
  target: number;
  isCustom?: boolean;
}

export const TASBIH_PRESETS: TasbihPreset[] = [
  {
    id: "subhan",
    label: "Субханаллах",
    meaning: "Пречист Аллаh",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Суб-ха-на-л-лаh",
    target: 33,
  },
  {
    id: "hamd",
    label: "Альхамдулилляh",
    meaning: "Хвала Аллаhу",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Аль-hам-ду ли-л-лаh",
    target: 33,
  },
  {
    id: "akbar",
    label: "Аллаhу акбар",
    meaning: "Аллаh Велик",
    arabic: "اللهُ أَكْبَرُ",
    transliteration: "Ал-ла-hу ак-бар",
    target: 34,
  },
  {
    id: "tahlil",
    label: "Ля иляhа илля Аллаh",
    meaning: "Нет божества, кроме Аллаhа",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    transliteration: "Ля и-ля-hа ил-ля Ал-лаh",
    target: 100,
  },
  {
    id: "salat",
    label: "Салават",
    meaning: "Молитва о Пророке ﷺ",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    transliteration: "Ал-ла-hум-ма сал-ли 'аля Му-hам-ма-дин",
    target: 100,
  },
  {
    id: "istighfar",
    label: "Астагfirullah",
    meaning: "Прошу прощения у Аллаhа",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Ас-таг-фи-ру-л-лаh",
    target: 33,
  },
];

export type TasbihPresetId = (typeof TASBIH_PRESETS)[number]["id"];

export function presetToTarget(p: TasbihPreset): DhikrTarget {
  return {
    id: p.id,
    label: p.label,
    meaning: p.meaning,
    arabic: p.arabic,
    transliteration: p.transliteration,
    target: p.target,
  };
}

export function customToTarget(c: {
  id: number;
  title: string;
  transliteration: string;
  target_count: number;
}): DhikrTarget {
  return {
    id: `custom-${c.id}`,
    label: c.title,
    arabic: "",
    transliteration: c.transliteration,
    target: c.target_count,
    isCustom: true,
  };
}
