"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Search, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { cozyCardClass } from "@/lib/animations";
import { playArabicAudio, primeArabicVoices } from "@/lib/arabic-audio";
import { fetchArabicWords, type ArabicWord } from "@/lib/arabic-words-api";
import { hapticSelection } from "@/lib/haptic";

const CATEGORIES = [
  "Все",
  "частотный",
  "семья",
  "еда",
  "молитва",
  "числа",
  "цвета",
  "природа",
  "эмоции",
  "время",
  "тело",
  "дом",
  "работа",
  "общее",
] as const;

export function ArabicDictionaryPanel() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<string>("Все");
  const [page, setPage] = useState(1);
  const [words, setWords] = useState<ArabicWord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 30;

  useEffect(() => {
    primeArabicVoices();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function loadWords() {
      setLoading(true);
      try {
        const response = await fetchArabicWords({
          search: debounced || undefined,
          category,
          page,
          pageSize,
        });
        if (!cancelled) {
          setWords(response.words);
          setTotal(response.total);
        }
      } catch {
        if (!cancelled) {
          setWords([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadWords();
    return () => {
      cancelled = true;
    };
  }, [category, debounced, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className={`${cozyCardClass} px-4 py-4`}>
      <p className="mb-1 text-sm font-semibold text-[var(--theme-text)]">
        Словарь — {total.toLocaleString("ru-RU")} слов
      </p>
      <p className="mb-3 text-xs text-[var(--theme-text-muted)]">
        Поиск по русскому, транскрипции или арабскому тексту
      </p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Найти слово..."
          className="w-full rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-300"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
              category === cat
                ? "border-sky-300 bg-sky-50 text-sky-800 dark:bg-sky-950/40"
                : "border-[var(--theme-border)] text-[var(--theme-text-muted)]"
            }`}
          >
            {cat === "Все" ? cat : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--theme-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загружаем...
        </div>
      ) : (
        <>
          <p className="mb-2 text-[10px] text-[var(--theme-text-muted)]">
            Страница {page} из {totalPages}
          </p>
          <ul className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {words.map((entry, i) => (
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
                    void playArabicAudio(entry.arabic, entry.audio_url);
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
                    {entry.arabic}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--theme-text)]">
                      {entry.translation_ru}
                    </p>
                    <p className="text-[10px] italic text-[var(--theme-text-muted)]">
                      {entry.transliteration}
                    </p>
                  </div>
                  <Volume2 className="h-4 w-4 shrink-0 text-emerald-600" />
                </motion.button>
              </motion.li>
            ))}
            {words.length === 0 && (
              <li className="py-8 text-center text-sm text-[var(--theme-text-muted)]">
                Ничего не найдено
              </li>
            )}
          </ul>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <motion.button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 rounded-xl border border-[var(--theme-border)] px-3 py-1.5 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Назад
              </motion.button>
              <motion.button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 disabled:opacity-40"
              >
                Далее
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
