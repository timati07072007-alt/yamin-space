/**
 * Import Kelly Arabic frequency list -> supabase/seed-arabic-kelly.sql
 * Requires: scripts/to_import.csv (UTF-8)
 * Run: node scripts/import-kelly-to-sql.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Basic EN -> RU for top vocabulary */
const EN_RU = {
  God: "Бог / Аллаh",
  Allah: "Аллаh",
  say: "Говорить",
  tell: "Рассказывать",
  state: "Заявлять",
  all: "Весь / все",
  every: "Каждый",
  each: "Каждый",
  no: "Нет",
  not: "Не",
  "don't": "Не (запрет)",
  had: "Иметь / был",
  be: "Быть",
  Lord: "Гospodь",
  man: "Человек / мужчина",
  woman: "Женщина",
  day: "День",
  year: "Год",
  time: "Время",
  work: "Работа",
  world: "Мир (мироздание)",
  life: "Жизнь",
  hand: "Рука",
  place: "Место",
  case: "Случай",
  government: "Правительство",
  company: "Компания",
  number: "Число",
  part: "Часть",
  country: "Страна",
  water: "Вода",
  money: "Деньги",
  night: "Ночь",
  eye: "Глаз",
  home: "Дом",
  house: "Дом",
  food: "Еда",
  book: "Книга",
  child: "Ребёнок",
  friend: "Друг",
  school: "Школа",
  city: "Город",
  car: "Машина",
  door: "Дверь",
  room: "Комната",
  love: "Любовь",
  peace: "Мир",
  war: "Война",
  sun: "Солнце",
  moon: "Луна",
  star: "Звезда",
  sea: "Море",
  river: "Река",
  mountain: "Гора",
  tree: "Дерево",
  flower: "Цветок",
  dog: "Собака",
  cat: "Кот",
  bird: "Птица",
  fish: "Рыба",
  bread: "Хлеб",
  milk: "Молоко",
  meat: "Мясо",
  fruit: "Фruit",
  good: "Хороший",
  bad: "Плохой",
  big: "Большой",
  small: "Маленький",
  new: "Новый",
  old: "Старый",
  long: "Длинный",
  short: "Короткий",
  high: "Высокий",
  low: "Низкий",
  first: "Первый",
  last: "Последний",
  next: "Следующий",
  other: "Другой",
  same: "Тот же",
  go: "Идти",
  come: "Приходить",
  see: "Видеть",
  know: "Знать",
  think: "Думать",
  take: "Брать",
  give: "Давать",
  make: "Делать",
  find: "Находить",
  want: "Хотеть",
  use: "Использовать",
  help: "Помогать",
  need: "Нуждаться",
  feel: "Чувствовать",
  leave: "Уходить",
  call: "Звонить",
  try: "Пытаться",
  ask: "Спрашивать",
  turn: "Поворачивать",
  move: "Двигаться",
  live: "Жить",
  believe: "Верить",
  hold: "Держать",
  bring: "Приносить",
  happen: "Происходить",
  write: "Писать",
  read: "Читать",
  sit: "Сидеть",
  stand: "Стоять",
  open: "Открывать",
  close: "Закрывать",
  start: "Начинать",
  stop: "Останавливать",
  wait: "Ждать",
  win: "Побеждать",
  lose: "Проигрывать",
  buy: "Покупать",
  sell: "Продавать",
  learn: "Учиться",
  teach: "Учить",
  speak: "Говорить",
  hear: "Слышать",
  eat: "Есть",
  drink: "Пить",
  sleep: "Спать",
  walk: "Ходить",
  run: "Бежать",
  play: "Играть",
  sing: "Петь",
  dance: "Танцевать",
  smile: "Улыбаться",
  cry: "Плакать",
  laugh: "Смеяться",
  thank: "Благодарить",
  please: "Пожалуйста",
  yes: "Да",
  yes_: "Да",
};

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function esc(s) {
  return s.replace(/'/g, "''");
}

function enToRu(en) {
  if (!en) return "—";
  const clean = en.replace(/\[.*?\]/g, "").trim().split(/[,;/]/)[0].trim();
  if (EN_RU[clean]) return EN_RU[clean];
  const lower = clean.toLowerCase();
  for (const [k, v] of Object.entries(EN_RU)) {
    if (k.toLowerCase() === lower) return v;
  }
  return clean;
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, "").replace(/\{\{c\d+::/g, "").replace(/\}\}/g, "");
}

const raw = readFileSync(join(__dirname, "to_import.csv"), "utf8");
const lines = raw.split(/\r?\n/).filter(Boolean);

const words = [];
const seen = new Set();

for (let i = 1; i < lines.length && words.length < 1000; i++) {
  const cols = parseCsvLine(lines[i]);
  const arabic = stripHtml(cols[0] || "").trim();
  const transliteration = (cols[2] || "").trim();
  const freq = parseFloat(cols[3] || "0") || 0;
  const english = [cols[5], cols[12], cols[19]]
    .map((c) => stripHtml(c || "").trim())
    .find(Boolean) || "";

  if (!arabic || arabic.length > 80) continue;
  const key = `${arabic}|${english}`;
  if (seen.has(key)) continue;
  seen.add(key);

  const ru = enToRu(english);
  const difficulty =
    freq > 3000 ? 1 : freq > 1000 ? 2 : freq > 400 ? 3 : freq > 100 ? 4 : 5;

  words.push({
    arabic,
    transliteration: transliteration || arabic,
    translation_ru: ru,
    category: "частотный",
    difficulty,
    word_frequency: Math.round(freq),
  });
}

words.sort((a, b) => b.word_frequency - a.word_frequency);

const values = words.map(
  (w) =>
    `('${esc(w.arabic)}', '${esc(w.transliteration)}', '${esc(w.translation_ru)}', '${esc(w.category)}', ${w.difficulty}, ${w.word_frequency})`,
);

const chunks = [];
for (let i = 0; i < values.length; i += 100) {
  chunks.push(values.slice(i, i + 100).join(",\n  "));
}

let sql = `-- Kelly frequency list: ${words.length} words\n\n`;
chunks.forEach((chunk, idx) => {
  sql += `INSERT INTO public.arabic_words (arabic, transliteration, translation_ru, category, difficulty, word_frequency)\nVALUES\n  ${chunk}\nON CONFLICT (arabic, translation_ru) DO NOTHING;\n\n`;
});

const out = join(__dirname, "..", "supabase", "seed-arabic-kelly.sql");
writeFileSync(out, sql, "utf8");
console.log(`Kelly import: ${words.length} words -> ${out}`);
