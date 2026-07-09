import { readFileSync, writeFileSync } from "node:fs";

const targets = process.argv.slice(2);
if (targets.length === 0) {
  targets.push("supabase/seed-academy.sql", "scripts/seed-academy.mjs");
}

const extra = [
  ["Абу Тalib", "\u0410\u0431\u0443 \u0422\u0430\u043b\u0438\u0431"],
  ["Абу Лахab", "\u0410\u0431\u0443 \u041b\u0430\u0445\u0430\u0431"],
  ["Хudейbiya", "\u0425\u0443\u0434\u0435\u0439\u0431\u0438\u044f"],
  ["Аqaba", "\u0410\u043a\u0430\u0431\u0430"],
  ["Бadr", "\u0411\u0430\u0434\u0440"],
  ["«Ar-Rahiq al-Makhtum»", "\u00ab\u0420\u0430\u0445\u0438\u043a \u0430\u043b\u044c-\u041c\u0430\u0445\u0442\u0443\u043c\u00bb"],
  ["«Аль-Fatiha»", "\u00ab\u0430\u043b\u044c-\u0424\u0430\u0442\u0438\u0445\u0430\u00bb"],
  ["«Аль-Baqara»", "\u00ab\u0430\u043b\u044c-\u0411\u0430\u043a\u0430\u0440\u0430\u00bb"],
  ["«Мuwatta»", "\u00ab\u041c\u0443\u0432\u0430\u0442\u0442\u0430\u00bb"],
  ["«Tafsir al-Jalalayn»", "\u00ab\u0422\u0430\u0444\u0441\u0438\u0440 \u0430\u043b\u044c-\u0414\u0436\u0430\u043b\u0430\u043b\u0435\u0439\u043d\u00bb"],
  ["«Umm al-Kitab»", "\u00ab\u0423\u043c\u043c \u0430\u043b\u044c-\u041a\u0438\u0442\u0430\u0431\u00bb"],
  ["«Riyadh as-Salihin»", "\u00ab\u0420\u0438\u044f\u0434 \u0430\u0441-\u0421\u0430\u043b\u0438\u0445\u0438\u043d\u00bb"],
  ["«As-Siddiq»", "\u00ab\u0410\u0441-\u0421\u0438\u0434\u0434\u0438\u043a\u00bb"],
  ["«Al-Adab al-Mufrad»", "\u00ab\u0410\u043b\u044c-\u0410\u0434\u0430\u0431 \u0430\u043b\u044c-\u041c\u0443\u0444\u0440\u0430\u0434\u00bb"],
  ["«Bulugh al-Maram»", "\u00ab\u0411\u0443\u043b\u0443\u0433 \u0430\u043b\u044c-\u041c\u0430\u0440\u0430\u043c\u00bb"],
  ["«Dhu an-Nun»", "\u00ab\u0417\u0443 \u0430\u043d-\u041d\u0443\u043d\u00bb"],
];

for (const path of targets) {
  let text = readFileSync(path, "utf8");
  for (const [from, to] of extra) {
    text = text.split(from).join(to);
  }
  writeFileSync(path, text, "utf8");
  console.log("fixed", path);
}
