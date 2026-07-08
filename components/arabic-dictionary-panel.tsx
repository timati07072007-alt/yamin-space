"use client";

import { motion } from "framer-motion";
import { Search, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";

import { cozyCardClass } from "@/lib/animations";
import { speakArabic } from "@/lib/arabic-alphabet";
import {
  ARABIC_VOCABULARY,
  searchVocabulary,
  VOCAB_CATEGORIES,
} from "@/lib/arabic-vocabulary";
import { hapticSelection } from "@/lib/haptic";

export function ArabicDictionaryPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Все");

  const results = useMemo(
    () => searchVocabulary(query, category),
    [query, category],
  );

  return (
    <div className={`${cozyCardClass} px-4 py-4`}>
      <p className="mb-1 text-sm font-semibold text-[var(--theme-text)]">
        Словарь — {ARABIC_VOCABULARY.length} слов
      </p>
      <p className="mb-3 text-xs text-[var(--theme-text-muted)]">
        Поиск по русскому, транскрипции или арабскому тексту
      </p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти слово..."
          className="w-full rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-300"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {VOCAB_CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
              category === cat
                ? "border-sky-300 bg-sky-50 text-sky-800 dark:bg-sky-950/40"
                : "border-[var(--theme-border)] text-[var(--theme-text-muted)]"
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      <p className="mb-2 text-[10px] text-[var(--theme-text-muted)]">
        Найдено: {results.length}
      </p>

      <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {results.map((entry, i) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.4) }}
          >
            <motion.button
              type="button"
              onClick={() => {
                hapticSelection();
                speakArabic(entry.speech);
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center gap-3 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2.5 text-left"
            >
              <span
                dir="rtl"
                lang="ar"
                className="min-w-[3rem] text-xl text-[var(--theme-text)]"
              >
                {entry.ar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--theme-text)]">
                  {entry.ru}
                </p>
                <p className="text-[10px] italic text-[var(--theme-text-muted)]">
                  {entry.transliteration}
                </p>
              </div>
              <Volume2 className="h-4 w-4 shrink-0 text-emerald-600" />
            </motion.button>
          </motion.li>
        ))}
        {results.length === 0 && (
          <li className="py-8 text-center text-sm text-[var(--theme-text-muted)]">
            Ничего не найдено
          </li>
        )}
      </ul>
    </div>
  );
}
