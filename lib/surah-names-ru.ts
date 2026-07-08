/**
 * Русские названия всех 114 сур Корана.
 * Используются для поиска («Корова», «Фатиха») и отображения в UI.
 */

export interface SurahRussianMeta {
  number: number;
  name: string;
  meaning: string;
  aliases: string[];
}

export const SURAH_NAMES_RU: SurahRussianMeta[] = [
  { number: 1, name: "Аль-Фатиха", meaning: "Открывающая", aliases: ["фатиха","открывающая"] },
  { number: 2, name: "Аль-Бакара", meaning: "Корова", aliases: ["корова","бакара"] },
  { number: 3, name: "Аль-Имран", meaning: "Семейство Имрана", aliases: ["имран"] },
  { number: 4, name: "Ан-Ниса", meaning: "Женщины", aliases: ["женщины","ниса"] },
  { number: 5, name: "Аль-Маида", meaning: "Трапеза", aliases: ["трапеза","маида"] },
  { number: 6, name: "Аль-Анам", meaning: "Скот", aliases: ["скот","анам"] },
  { number: 7, name: "Аль-Араф", meaning: "Преграды", aliases: ["араф","преграды"] },
  { number: 8, name: "Аль-Анфаль", meaning: "Добыча", aliases: ["анфаль","добыча"] },
  { number: 9, name: "Аль-Тауба", meaning: "Покаяние", aliases: ["тауба","покаяние","тавба"] },
  { number: 10, name: "Йунус", meaning: "Иона", aliases: ["юнус","иона"] },
  { number: 11, name: "Худ", meaning: "Худ", aliases: ["худ"] },
  { number: 12, name: "Юсуф", meaning: "Иосиф", aliases: ["юсуф","иосиф"] },
  { number: 13, name: "Ар-Раад", meaning: "Гром", aliases: ["раад","гром"] },
  { number: 14, name: "Ибрахим", meaning: "Ибрахим", aliases: ["ибрахим"] },
  { number: 15, name: "Аль-Хиджр", meaning: "Хиджр", aliases: ["хиджр"] },
  { number: 16, name: "Ан-Нахл", meaning: "Пчёлы", aliases: ["пчёлы","пчелы","нахл"] },
  { number: 17, name: "Аль-Исра", meaning: "Ночной перенос", aliases: ["исра","ночной перенос"] },
  { number: 18, name: "Аль-Кахф", meaning: "Пещера", aliases: ["кахф","пещера"] },
  { number: 19, name: "Марьям", meaning: "Мария", aliases: ["марьям","мария"] },
  { number: 20, name: "Та-Ха", meaning: "Та-Ха", aliases: ["та ха","таха"] },
  { number: 21, name: "Аль-Анбийа", meaning: "Пророки", aliases: ["анбийа","пророки"] },
  { number: 22, name: "Аль-Хадж", meaning: "Паломничество", aliases: ["хадж","паломничество"] },
  { number: 23, name: "Аль-Муминун", meaning: "Верующие", aliases: ["муминун","верующие","муминун"] },
  { number: 24, name: "Ан-Нур", meaning: "Свет", aliases: ["нур","свет"] },
  { number: 25, name: "Аль-Фуркан", meaning: "Различение", aliases: ["фуркан","различение"] },
  { number: 26, name: "Аш-Схуара", meaning: "Поэты", aliases: ["шуара","поэты","поэты"] },
  { number: 27, name: "Ан-Намл", meaning: "Муравьи", aliases: ["намл","муравьи","намл"] },
  { number: 28, name: "Аль-Касас", meaning: "Рассказ", aliases: ["касас","рассказ","касас"] },
  { number: 29, name: "Аль-Анкабут", meaning: "Паук", aliases: ["анкабут","паук","анкабут"] },
  { number: 30, name: "Ар-Рум", meaning: "Римляне", aliases: ["рум","римляне","рум"] },
  { number: 31, name: "Лукман", meaning: "Лукман", aliases: ["лукман","лукман"] },
  { number: 32, name: "Ас-Саджда", meaning: "Земной поклон", aliases: ["саджда","поклон","саджда","земной поклон"] },
  { number: 33, name: "Аль-Ахзаб", meaning: "Союзники", aliases: ["ахзаб","союзники","ахзаб"] },
  { number: 34, name: "Ас-Саба", meaning: "Саба", aliases: ["саба","саба"] },
  { number: 35, name: "Фатир", meaning: "Творец", aliases: ["фатир","творец","фатир"] },
  { number: 36, name: "Йа-Син", meaning: "Йа-Син", aliases: ["йасин","йа син","я син"] },
  { number: 37, name: "Ас-Саффат", meaning: "Выстроившиеся", aliases: ["саффат","выстроившиеся"] },
  { number: 38, name: "Сад", meaning: "Сад", aliases: ["сад","сад"] },
  { number: 39, name: "Аз-Зумар", meaning: "Толпы", aliases: ["зумар","толпы","зумар"] },
  { number: 40, name: "Гхафир", meaning: "Прощающий", aliases: ["гхафир","прощающий","гафир"] },
  { number: 41, name: "Фуссилат", meaning: "Разъяснены", aliases: ["фуссилат","разъяснены","фуссилат"] },
  { number: 42, name: "Аш-Схура", meaning: "Совет", aliases: ["схура","совет","шура"] },
  { number: 43, name: "Аз-Зукхруф", meaning: "Украшения", aliases: ["зукхруф","украшения","зухруф"] },
  { number: 44, name: "Ад-Дукхан", meaning: "Дым", aliases: ["дукхан","дым","духан"] },
  { number: 45, name: "Аль-Джатхийа", meaning: "Коленопреклонённые", aliases: ["джатхийа","коленопреклонённые","джасия"] },
  { number: 46, name: "Аль-Ахкаф", meaning: "Барханы", aliases: ["ахкаф","барханы"] },
  { number: 47, name: "Мухаммад", meaning: "Мухаммад", aliases: ["мухаммад","мухаммад"] },
  { number: 48, name: "Аль-Фатх", meaning: "Победа", aliases: ["фатх","победа","фатх"] },
  { number: 49, name: "Аль-Худжурат", meaning: "Комнаты", aliases: ["худжурат","комнаты"] },
  { number: 50, name: "Каф", meaning: "Каф", aliases: ["каф","каф"] },
  { number: 51, name: "Ад-Дхарийат", meaning: "Рассеивающие", aliases: ["дхарийат","рассеивающие"] },
  { number: 52, name: "Ат-Тур", meaning: "Гора", aliases: ["тур","гора","тур"] },
  { number: 53, name: "Ан-Наджм", meaning: "Звезда", aliases: ["наджм","звезда","наджм"] },
  { number: 54, name: "Аль-Камар", meaning: "Месяц", aliases: ["камар","месяц","камар"] },
  { number: 55, name: "Ар-Рахман", meaning: "Милостивый", aliases: ["рахман","милостивый","рахман"] },
  { number: 56, name: "Аль-Вакиа", meaning: "Свершающееся", aliases: ["вакиа","свершающееся","вакиа"] },
  { number: 57, name: "Аль-Хадид", meaning: "Железо", aliases: ["хадид","железо","хадид"] },
  { number: 58, name: "Аль-Муджадила", meaning: "Препирающаяся", aliases: ["муджадила","препирающаяся"] },
  { number: 59, name: "Аль-Хасхр", meaning: "Собрание", aliases: ["хасхр","собрание","хашр"] },
  { number: 60, name: "Аль-Мумтахина", meaning: "Испытуемая", aliases: ["мумтахина","испытуемая"] },
  { number: 61, name: "Ас-Сафф", meaning: "Ряды", aliases: ["сафф","ряды","сафф"] },
  { number: 62, name: "Аль-Джумуа", meaning: "Пятница", aliases: ["джумуа","пятница","джумуа"] },
  { number: 63, name: "Аль-Мунафикун", meaning: "Лицемеры", aliases: ["мунафикун","лицемеры"] },
  { number: 64, name: "Ат-Тагхабун", meaning: "Обольщение", aliases: ["тагхабун","обольщение"] },
  { number: 65, name: "Ат-Талак", meaning: "Развод", aliases: ["талак","развод","талак"] },
  { number: 66, name: "Ат-Тахрим", meaning: "Запрет", aliases: ["тахрим","запрет"] },
  { number: 67, name: "Аль-Мулк", meaning: "Власть", aliases: ["мулк","власть","мулк"] },
  { number: 68, name: "Аль-Калам", meaning: "Перо", aliases: ["калам","перо","калам"] },
  { number: 69, name: "Аль-Хакках", meaning: "Неотвратимая", aliases: ["хакках","неотвратимая","хакка"] },
  { number: 70, name: "Аль-Мааридж", meaning: "Степени", aliases: ["мааридж","степени","мааридж"] },
  { number: 71, name: "Нух", meaning: "Нух", aliases: ["нух","нух"] },
  { number: 72, name: "Аль-Джинн", meaning: "Джинны", aliases: ["джинн","джинны"] },
  { number: 73, name: "Аль-Муззаммил", meaning: "Закутавшийся", aliases: ["муззаммил","закутавшийся"] },
  { number: 74, name: "Аль-Муддатхтхир", meaning: "Покрывшийся", aliases: ["муддатхтхир","покрывшийся"] },
  { number: 75, name: "Аль-Кийама", meaning: "Воскресение", aliases: ["кийама","воскресение","кияма"] },
  { number: 76, name: "Аль-Инсан", meaning: "Человек", aliases: ["инсан","человек","инсан"] },
  { number: 77, name: "Аль-Мурсалат", meaning: "Посланные", aliases: ["мурсалат","направляемые","посланные"] },
  { number: 78, name: "Ан-Наба", meaning: "Весть", aliases: ["наба","весть","наба"] },
  { number: 79, name: "Ан-Назиат", meaning: "Вырывающие", aliases: ["назиат","вырывающие"] },
  { number: 80, name: "Абаса", meaning: "Нахмурился", aliases: ["абаса","нахмурился"] },
  { number: 81, name: "Ат-Таквир", meaning: "Свертывание", aliases: ["таквир","свертывание"] },
  { number: 82, name: "Аль-Инфитар", meaning: "Раскалывание", aliases: ["инфитар","раскалывание"] },
  { number: 83, name: "Аль-Мутаффифин", meaning: "Обвешивающие", aliases: ["мутаффифин","обвешивающие"] },
  { number: 84, name: "Аль-Инсхикак", meaning: "Раскалывание", aliases: ["инсхикак","раскалывание"] },
  { number: 85, name: "Аль-Бурудж", meaning: "Созвездия", aliases: ["бурудж","созвездия","бурудж"] },
  { number: 86, name: "Ат-Тарик", meaning: "Ночной путь", aliases: ["тарик","ночной","тарик"] },
  { number: 87, name: "Аль-Ала", meaning: "Всевышний", aliases: ["ала","всевышний"] },
  { number: 88, name: "Аль-Гхасхийа", meaning: "Покрывающее", aliases: ["гхасхийа","покрывающее"] },
  { number: 89, name: "Аль-Фаджр", meaning: "Заря", aliases: ["фаджр","заря","фаджр"] },
  { number: 90, name: "Аль-Балад", meaning: "Город", aliases: ["балад","город"] },
  { number: 91, name: "Аш-Схамс", meaning: "Солнце", aliases: ["схамс","солнце","шамс"] },
  { number: 92, name: "Аль-Лайл", meaning: "Ночь", aliases: ["лайл","ночь","лайл"] },
  { number: 93, name: "Ад-Духа", meaning: "Утро", aliases: ["духа","утро","духа"] },
  { number: 94, name: "Аш-Схарх", meaning: "Раскрытие", aliases: ["схарх","раскрытие"] },
  { number: 95, name: "Ат-Тин", meaning: "Инжир", aliases: ["тин","инжир","тин"] },
  { number: 96, name: "Аль-Алак", meaning: "Сгусток", aliases: ["алак","сгусток"] },
  { number: 97, name: "Аль-Кадр", meaning: "Предопределение", aliases: ["кадр","предопределение","кадр","ночь предопределения"] },
  { number: 98, name: "Аль-Баййинах", meaning: "Ясное свидетельство", aliases: ["баййинах","ясное","байина"] },
  { number: 99, name: "Аз-Залзалах", meaning: "Землетрясение", aliases: ["залзалах","землетрясение"] },
  { number: 100, name: "Аль-Адийат", meaning: "Скачущие", aliases: ["адийат","скачущие"] },
  { number: 101, name: "Аль-Кариах", meaning: "Поглощающая", aliases: ["кариах","кариа","поглощающая"] },
  { number: 102, name: "Ат-Такатхур", meaning: "Стремление к приумножению", aliases: ["такатхур","приумножению"] },
  { number: 103, name: "Аль-Аср", meaning: "Время", aliases: ["аср","время","аср"] },
  { number: 104, name: "Аль-Хумазах", meaning: "Злослов", aliases: ["хумазах","злослов"] },
  { number: 105, name: "Аль-Фил", meaning: "Слон", aliases: ["фил","слон","фил"] },
  { number: 106, name: "Курайш", meaning: "Курайш", aliases: ["курайш","quraysh"] },
  { number: 107, name: "Аль-Маун", meaning: "Мелочь", aliases: ["маун","маун","мелочь"] },
  { number: 108, name: "Аль-Кавтхар", meaning: "Изобилие", aliases: ["кавтхар","изобилие","каусар"] },
  { number: 109, name: "Аль-Кафирун", meaning: "Неверующие", aliases: ["кафирун","неверующие","кафирун"] },
  { number: 110, name: "Ан-Наср", meaning: "Помощь", aliases: ["наср","помощь","наср"] },
  { number: 111, name: "Аль-Масад", meaning: "Льняные волокна", aliases: ["масад","масад","льняные волокна"] },
  { number: 112, name: "Аль-Икхлас", meaning: "Искренность", aliases: ["икхлас","искренность","ихлас"] },
  { number: 113, name: "Аль-Фалак", meaning: "Рассвет", aliases: ["фалак","рассвет"] },
  { number: 114, name: "Ан-Нас", meaning: "Люди", aliases: ["нас","люди","нас"] },
];

const META_BY_NUMBER = new Map(
  SURAH_NAMES_RU.map((item) => [item.number, item]),
);

export function getSurahRussianMeta(number: number): SurahRussianMeta | undefined {
  return META_BY_NUMBER.get(number);
}

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function surahMatchesQuery(
  surah: {
    number: number;
    englishName: string;
    translationName: string;
    arabicName: string;
  },
  rawQuery: string,
): boolean {
  const query = normalizeSearch(rawQuery);

  if (!query) {
    return true;
  }

  if (String(surah.number) === query) {
    return true;
  }

  const meta = getSurahRussianMeta(surah.number);

  const haystack = normalizeSearch(
    [
      surah.englishName,
      surah.translationName,
      surah.arabicName,
      meta?.name,
      meta?.meaning,
      ...(meta?.aliases ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );

  return haystack.includes(query);
}
