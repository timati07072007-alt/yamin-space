import { writeFileSync } from "node:fs";

const easy = [
  ["Сколько столпов Ислама?", ["Три", "Пять", "Семь", "Девять"], 1],
  ["Как называется ежедневная молитва?", ["Закят", "Саум", "Намаз", "Хадж"], 2],
  ["В каком месяце пост Рамадан?", ["Шавваль", "Рамадан", "Раджаб", "Мухаррам"], 1],
  ["Как называется свидетество веры?", ["Салят", "Шахада", "Закят", "Саум"], 1],
  ["Сколько сур в Коране?", ["100", "114", "120", "99"], 1],
  ["Как называется направление для молитвы?", ["Кибла", "Михраб", "Минбар", "Муаззин"], 0],
  ["Кто был последним Пророком?", ["Иса (а.с.)", "Муса (а.с.)", "Мухаммад ﷺ", "Ибрахим (а.с.)"], 2],
  ["Сколько раз в день обязательный намаз?", ["Три", "Четыре", "Пять", "Шесть"], 2],
  ["Как называется пост?", ["Закят", "Саум", "Хадж", "Итикаф"], 1],
  ["В каком городе родился Пророк ﷺ?", ["Медина", "Мекка", "Иерусалим", "Дамаск"], 1],
  ["Как называется паломничество в Мекку?", ["Умра", "Хадж", "Итикаф", "Таравих"], 1],
  ["Кто принёс первое откровение?", ["Микаил", "Джибриль", "Исрафил", "Азраил"], 1],
  ["Как называется ежегодная милостыня?", ["Садака", "Закят", "Фитр", "Хумс"], 1],
  ["Как называется священная книга мусульман?", ["Тора", "Инджил", "Коран", "Псалтырь"], 2],
  ["Как называется молитва в пятницу?", ["Таравих", "Джумуа", "Витр", "Тахаджjud"], 1],
  ["Сколько частей (джузов) в Коране?", ["20", "30", "40", "114"], 1],
  ["Как называется малое паломничество?", ["Хадж", "Умра", "Итикаф", "Саум"], 1],
  ["Кто первый пророк?", ["Нух", "Адам (а.с.)", "Идрис", "Ибрахим"], 1],
  ["Как называется ночная молитва в Рамадан?", ["Витр", "Таравих", "Тахаджjud", "Наfl"], 1],
  ["Как называется дом Аллаha в Мекке?", ["Мечеть", "Кааба", "Минaret", "Михраб"], 1],
];

const medium = [
  ["Куда был перенесён Пророк ﷺ в ночь Исра?", ["Медина", "Иерусалим", "Мекка", "Тайф"], 1],
  ["Как называлась первая мечеть в Исламе?", ["Аль-Акса", "Куба", "Ан-Нabawi", "Каaba"], 1],
  ["Какая битва была первой?", ["Ухуд", "Бадр", "Хandaq", "Хunayn"], 1],
  ["Кто был первым халифом?", ["Умар", "Уthman", "Абу Bakr", "Ali"], 2],
  ["Кто составил Сахих al-Bukhari?", ["Мусlim", "Аль-Bukhari", "Ат-Tirmidhi", "Ан-Nawawi"], 1],
  ["Сколько лет Пророк ﷺ пророчествовал?", ["10", "13", "23", "40"], 2],
  ["Как называется год скорби?", ["Год слona", "10-й год пророчества", "Год слёз", "2 AH"], 1],
  ["Кто была мать Пророка ﷺ?", ["Хadija", "Амina", "Fatima", "Asiya"], 1],
  ["Кто был опекуном Пророка ﷺ?", ["Hamza", "Abu Talib", "Abbas", "Abu Lahab"], 1],
  ["Как называется договор в Хudaybiya?", ["Constitution", "Hudaybiya Treaty", "Akaba", "Badr"], 1],
  ["Кто первый муаззин?", ["Ali", "Bilal", "Umar", "Abu Bakr"], 1],
  ["Какая сura без bismillah?", ["At-Tawba", "Al-Fatiha", "Al-Ikhlas", "An-Nas"], 0],
  ["Сколько аятов в al-Fatiha?", ["5", "6", "7", "8"], 2],
  ["Кто написал «Ar-Rahiq al-Makhtum»?", ["Ibn Kathir", "Al-Mubarakpuri", "As-Suyuti", "At-Tabari"], 1],
  ["Как называется ночь al-Qadr?", ["15 Shaban", "Laylat al-Qadr", "Laylat al-Isra", "Laylat al-Mi'raj"], 1],
  ["Кто была первая жена Пророка ﷺ?", ["Aisha", "Khadija", "Sawda", "Hafsa"], 1],
  ["Хадис о намерениях — первый в?", ["Muslim", "Bukhari", "Muwatta", "Tirmidhi"], 1],
  ["Сколько основных категорий hadith?", ["2", "3", "4", "5"], 1],
  ["Кто был «вторым в пещере»?", ["Ali", "Abu Bakr", "Umar", "Hamza"], 1],
  ["Как называется миграция в Медину?", ["Hijra", "Isra", "Hajj", "Umrah"], 0],
];

const hard = [
  ["Сколько аятов в al-Baqara?", ["200", "255", "286", "300"], 2],
  ["Кто составил «Muwatta»?", ["Malik ibn Anas", "Al-Bukhari", "Muslim", "Ahmad ibn Hanbal"], 0],
  ["Какой год — «Год слона»?", ["Year of Elephant", "Year of Sorrow", "Year of Hijra", "Year of Badr"], 0],
  ["Сколько мазhabов в суннитском fiqh?", ["2", "3", "4", "5"], 2],
  ["Кто автор «Tafsir al-Jalalayn»?", ["Ibn Taymiyyah", "Jalal ad-Din al-Mahalli", "Al-Ghazali", "Ibn Hazm"], 1],
  ["Как называется ayat an-Nur?", ["Ayat al-Kursi", "Light verse", "Throne verse", "Last verse"], 1],
  ["Сколько дней основных rites Hajj?", ["3", "5", "7", "10"], 1],
  ["Кто «Sayyid ash-Shuhada»?", ["Hamza", "Ali", "Umar", "Uthman"], 0],
  ["Какая surah — «Umm al-Kitab»?", ["Al-Baqara", "Al-Fatiha", "Al-Ikhlas", "Ya-Sin"], 1],
  ["Сколько juz в Коране?", ["20", "30", "40", "114"], 1],
  ["Кто составил «Riyadh as-Salihin»?", ["An-Nawawi", "Al-Bukhari", "Ibn Majah", "Ad-Daraqutni"], 0],
  ["Кто был «As-Siddiq»?", ["Umar", "Abu Bakr", "Ali", "Uthman"], 1],
  ["Кто автор «Al-Adab al-Mufrad»?", ["Al-Bukhari", "Muslim", "Abu Dawud", "At-Tirmidhi"], 0],
  ["В каком году был завоеван Мекka?", ["6 AH", "8 AH", "10 AH", "2 AH"], 1],
  ["Сколько жён у Пророка ﷺ после Хadija (прибл.)?", ["5", "9", "13", "15"], 2],
  ["Кто составил «Bulugh al-Maram»?", ["Ibn Hajar", "Ibn Rajab", "Al-Hafiz", "Ibn Kathir"], 0],
  ["Какой месяц начинает исламский календарь?", ["Ramadan", "Muharram", "Rajab", "Shawwal"], 1],
  ["Как называется surah Ya-Sin?", ["Heart of Quran", "Throne", "Light", "Opening"], 0],
  ["Кто «Dhu an-Nun»?", ["Yunus", "Musa", "Isa", "Ibrahim"], 0],
  ["Сколько times mentioned «Salat» in Quran (approx)?", ["50", "100", "150", "200"], 1],
];

function esc(s) {
  return s.replace(/'/g, "''");
}

function row(quizId, q, xp, coins) {
  const [text, opts, correct] = q;
  const arr = `array['${opts.map(esc).join("','")}']`;
  return `(${quizId}, '${esc(text)}', ${arr}, ${correct}, ${xp}, ${coins})`;
}

const rows = [
  ...easy.map((q) => row(4, q, 10, 5)),
  ...medium.map((q) => row(5, q, 15, 8)),
  ...hard.map((q) => row(6, q, 25, 12)),
];

const sql = `-- Academy quizzes 4/5/6 with 60 unique questions
INSERT INTO quizzes (id, title, category, difficulty) OVERRIDING SYSTEM VALUE VALUES
  (4, 'Академия: Легко', 'Академия', 'easy'),
  (5, 'Академия: Средне', 'Академия', 'medium'),
  (6, 'Академия: Хардкор', 'Академия', 'hard')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, difficulty = EXCLUDED.difficulty;

SELECT setval(pg_get_serial_sequence('quizzes', 'id'), GREATEST((SELECT MAX(id) FROM quizzes), 6));

DELETE FROM questions WHERE quiz_id IN (4, 5, 6);

INSERT INTO questions (quiz_id, question_text, options, correct_option_index, xp_reward, coins_reward) VALUES
${rows.join(",\n")};
`;

writeFileSync("supabase/seed-academy.sql", sql, "utf8");
console.log("questions:", rows.length);
