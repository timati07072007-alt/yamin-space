/**
 * Преобразует латинскую транслитерацию Корана (издание en.transliteration
 * на api.alquran.cloud) в привычную русскую транскрипцию.
 *
 * Пример: "Bismillaahir Rahmaanir Raheem" → "Бисмилляхир Рахманир Рахим".
 */

/** Многобуквенные сочетания — проверяются раньше одиночных букв. */
const DIGRAPHS: Array<[string, string]> = [
  ["sh", "ш"],
  ["ch", "ч"],
  ["kh", "х"],
  ["gh", "гъ"],
  ["th", "с"],
  ["dh", "з"],
  ["zh", "ж"],
  ["aa", "а"],
  ["ee", "и"],
  ["oo", "у"],
  ["uu", "у"],
  ["ii", "и"],
  ["ay", "ай"],
  ["ai", "ай"],
  ["aw", "ау"],
  ["au", "ау"],
  ["ya", "я"],
  ["yu", "ю"],
  ["yi", "йи"],
  ["yy", "йй"],
];

const SINGLE: Record<string, string> = {
  a: "а",
  b: "б",
  c: "к",
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "х",
  i: "и",
  j: "дж",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "к",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "в",
  x: "кс",
  y: "й",
  z: "з",
};

function capitalizeFirst(value: string): string {
  return value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}

export function latinToRussianTranscription(latin: string): string {
  let result = "";
  let i = 0;

  while (i < latin.length) {
    const char = latin[i];
    const lower = char.toLowerCase();
    const isUpper = char !== lower;

    // Апострофы (айн/хамза) в русской транскрипции опускаются.
    if (char === "'" || char === "\u2019" || char === "\u02bb") {
      i += 1;
      continue;
    }

    const pair = lower + (latin[i + 1]?.toLowerCase() ?? "");
    const digraph = DIGRAPHS.find(([from]) => from === pair);

    if (digraph) {
      result += isUpper ? capitalizeFirst(digraph[1]) : digraph[1];
      i += 2;
      continue;
    }

    const mapped = SINGLE[lower];

    if (mapped !== undefined) {
      result += isUpper ? capitalizeFirst(mapped) : mapped;
    } else {
      result += char;
    }

    i += 1;
  }

  // Удвоенная "л" перед гласной традиционно смягчается («лилляхи», «илля»),
  // но имя «Аллах» пишется через твёрдую «л».
  return result.replace(/лла/g, "лля").replace(/Алля/g, "Алла");
}
