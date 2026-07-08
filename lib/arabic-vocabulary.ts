export interface VocabEntry {
  id: string;
  ar: string;
  ru: string;
  transliteration: string;
  category: string;
  speech: string;
}

export const VOCAB_CATEGORIES = [
  "Все",
  "Намаз",
  "Семья",
  "Природа",
  "Еда",
  "Числа",
  "Время",
  "Учёба",
] as const;

export const ARABIC_VOCABULARY: VocabEntry[] = [
  { id: "1", ar: "الله", ru: "Аллаh", transliteration: "Ал-лаh", category: "Намаз", speech: "الله" },
  { id: "2", ar: "مَسْجِد", ru: "Мечеть", transliteration: "Мас-джид", category: "Намаз", speech: "مسجد" },
  { id: "3", ar: "صَلَاة", ru: "Намаз", transliteration: "Sa-ляt", category: "Намаз", speech: "صلاة" },
  { id: "4", ar: "قُرْآن", ru: "Коран", transliteration: "Ku-ран", category: "Намаз", speech: "قرآن" },
  { id: "5", ar: "دُعَاء", ru: "Мольба", transliteration: "Du-'a", category: "Намаз", speech: "دعاء" },
  { id: "6", ar: "وُضُوء", ru: "Омовение", transliteration: "Wu-ду'", category: "Намаз", speech: "وضوء" },
  { id: "7", ar: "إِمَام", ru: "Имам", transliteration: "И-мam", category: "Намаз", speech: "إمام" },
  { id: "8", ar: "سَجَّادَة", ru: "Коврик для намаза", transliteration: "Sad-жа-da", category: "Намаз", speech: "سجادة" },
  { id: "9", ar: "أَب", ru: "Отец", transliteration: "Ab", category: "Семья", speech: "أب" },
  { id: "10", ar: "أُمّ", ru: "Мать", transliteration: "Umm", category: "Семья", speech: "أم" },
  { id: "11", ar: "أَخ", ru: "Брат", transliteration: "Akh", category: "Семья", speech: "أخ" },
  { id: "12", ar: "أُخْت", ru: "Сестра", transliteration: "Ukht", category: "Семья", speech: "أخت" },
  { id: "13", ar: "ابْن", ru: "Сын", transliteration: "Ibn", category: "Семья", speech: "ابن" },
  { id: "14", ar: "بِنْت", ru: "Дочь", transliteration: "Bint", category: "Семья", speech: "بنت" },
  { id: "15", ar: "جَدّ", ru: "Дедушка", transliteration: "Jadd", category: "Семья", speech: "جد" },
  { id: "16", ar: "جَدَّة", ru: "Бабушка", transliteration: "Jad-da", category: "Семья", speech: "جدة" },
  { id: "17", ar: "مَاء", ru: "Вода", transliteration: "Ma'", category: "Природа", speech: "ماء" },
  { id: "18", ar: "نُور", ru: "Свет", transliteration: "Nur", category: "Природа", speech: "نور" },
  { id: "19", ar: "شَمْس", ru: "Солнце", transliteration: "Shams", category: "Природа", speech: "شمس" },
  { id: "20", ar: "قَمَر", ru: "Луна", transliteration: "Qa-mar", category: "Природа", speech: "قمر" },
  { id: "21", ar: "نَجْم", ru: "Звезда", transliteration: "Najm", category: "Природа", speech: "نجم" },
  { id: "22", ar: "سَمَاء", ru: "Небо", transliteration: "Sa-ma'", category: "Природа", speech: "سماء" },
  { id: "23", ar: "أَرْض", ru: "Земля", transliteration: "Ard", category: "Природа", speech: "أرض" },
  { id: "24", ar: "شَجَرَة", ru: "Дерево", transliteration: "Shad-жа-ra", category: "Природа", speech: "شجرة" },
  { id: "25", ar: "وَرْدَة", ru: "Роза", transliteration: "War-da", category: "Природа", speech: "وردة" },
  { id: "26", ar: "طَعَام", ru: "Еда", transliteration: "Ta-'am", category: "Еда", speech: "طعام" },
  { id: "27", ar: "خُبْز", ru: "Хлеб", transliteration: "Khubz", category: "Еда", speech: "خبز" },
  { id: "28", ar: "لَحْم", ru: "Мясо", transliteration: "Lahm", category: "Еда", speech: "لحم" },
  { id: "29", ar: "فَاكِهَة", ru: "Фрукт", transliteration: "Fa-ki-ha", category: "Еда", speech: "فاكهة" },
  { id: "30", ar: "تُفَّاح", ru: "Яблоко", transliteration: "Tuf-fah", category: "Еда", speech: "تفاح" },
  { id: "31", ar: "حَلِيب", ru: "Молоко", transliteration: "Ha-lib", category: "Еда", speech: "حليب" },
  { id: "32", ar: "وَاحِد", ru: "Один", transliteration: "Wa-hid", category: "Числа", speech: "واحد" },
  { id: "33", ar: "اِثْنَان", ru: "Два", transliteration: "Ith-nan", category: "Числа", speech: "اثنان" },
  { id: "34", ar: "ثَلَاثَة", ru: "Три", transliteration: "Tha-la-tha", category: "Числа", speech: "ثلاثة" },
  { id: "35", ar: "أَرْبَعَة", ru: "Четыре", transliteration: "Ar-ba-'a", category: "Числа", speech: "أربعة" },
  { id: "36", ar: "خَمْسَة", ru: "Пять", transliteration: "Kham-sa", category: "Числа", speech: "خمسة" },
  { id: "37", ar: "عَشَرَة", ru: "Десять", transliteration: "'A-sha-ra", category: "Числа", speech: "عشرة" },
  { id: "38", ar: "مِائَة", ru: "Сто", transliteration: "Mi-'a", category: "Числа", speech: "مائة" },
  { id: "39", ar: "يَوْم", ru: "День", transliteration: "Yawm", category: "Время", speech: "يوم" },
  { id: "40", ar: "لَيْل", ru: "Ночь", transliteration: "Layl", category: "Время", speech: "ليل" },
  { id: "41", ar: "صَبَاح", ru: "Утро", transliteration: "Sa-bah", category: "Время", speech: "صباح" },
  { id: "42", ar: "مَسَاء", ru: "Вечер", transliteration: "Ma-sa'", category: "Время", speech: "مساء" },
  { id: "43", ar: "سَاعَة", ru: "Час", transliteration: "Sa-'a", category: "Время", speech: "ساعة" },
  { id: "44", ar: "دَقِيقَة", ru: "Минута", transliteration: "Da-qi-qa", category: "Время", speech: "دقيقة" },
  { id: "45", ar: "كِتَاب", ru: "Книга", transliteration: "Ki-tab", category: "Учёба", speech: "كتاب" },
  { id: "46", ar: "قَلَم", ru: "Ручка", transliteration: "Qalam", category: "Учёба", speech: "قلم" },
  { id: "47", ar: "دَفْتَر", ru: "Тетрадь", transliteration: "Daf-tar", category: "Учёба", speech: "دفتر" },
  { id: "48", ar: "مَدْرَسَة", ru: "Школа", transliteration: "Mad-ra-sa", category: "Учёба", speech: "مدرسة" },
  { id: "49", ar: "مُعَلِّم", ru: "Учитель", transliteration: "Mu-'al-lim", category: "Учёба", speech: "معلم" },
  { id: "50", ar: "طَالِب", ru: "Ученик", transliteration: "Ta-lib", category: "Учёба", speech: "طالب" },
  { id: "51", ar: "عِلْم", ru: "Знание", transliteration: "'Ilm", category: "Учёба", speech: "علم" },
  { id: "52", ar: "سَلَام", ru: "Мир / Привет", transliteration: "Sa-lam", category: "Семья", speech: "سلام" },
  { id: "53", ar: "بَيْت", ru: "Дом", transliteration: "Bayt", category: "Семья", speech: "بيت" },
  { id: "54", ar: "بَاب", ru: "Дверь", transliteration: "Bab", category: "Семья", speech: "باب" },
  { id: "55", ar: "قَلْب", ru: "Сердце", transliteration: "Qalb", category: "Природа", speech: "قلب" },
  { id: "56", ar: "جَنَّة", ru: "Рай", transliteration: "Jan-na", category: "Намаз", speech: "جنة" },
  { id: "57", ar: "صَدِيق", ru: "Друг", transliteration: "Sa-diq", category: "Семья", speech: "صديق" },
  { id: "58", ar: "حُبّ", ru: "Любовь", transliteration: "Hubb", category: "Семья", speech: "حب" },
  { id: "59", ar: "رَحْمَة", ru: "Милость", transliteration: "Rah-ma", category: "Намаз", speech: "رحمة" },
  { id: "60", ar: "شُكْر", ru: "Благодарность", transliteration: "Shukr", category: "Намаз", speech: "شكر" },
];

export function searchVocabulary(query: string, category: string): VocabEntry[] {
  const q = query.trim().toLowerCase();
  return ARABIC_VOCABULARY.filter((entry) => {
    if (category !== "Все" && entry.category !== category) return false;
    if (!q) return true;
    return (
      entry.ru.toLowerCase().includes(q) ||
      entry.transliteration.toLowerCase().includes(q) ||
      entry.ar.includes(query.trim()) ||
      entry.category.toLowerCase().includes(q)
    );
  });
}
