"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import { cozyCardClass } from "@/lib/animations";
import { playArabicAudio, primeArabicVoices } from "@/lib/arabic-audio";
import {
  fetchLearnBatch,
  submitWordProgress,
  type ArabicWord,
} from "@/lib/arabic-words-api";
import { hapticImpact, hapticSelection, hapticSuccess } from "@/lib/haptic";

type LearnMode = "flashcard" | "quiz";
type QuizOption = { text: string; correct: boolean };

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuizOptions(word: ArabicWord, pool: ArabicWord[]): QuizOption[] {
  const distractors = pool
    .filter((w) => w.id !== word.id)
    .slice(0, 12);
  const wrong = shuffle(distractors).slice(0, 3);
  return shuffle([
    { text: word.translation_ru, correct: true },
    ...wrong.map((w) => ({ text: w.translation_ru, correct: false })),
  ]);
}

export function ArabicLearnPanel() {
  const { dbUser, isDevMode } = useTelegram();
  const [mode, setMode] = useState<LearnMode>("flashcard");
  const [words, setWords] = useState<ArabicWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionXp, setSessionXp] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const current = words[index];

  const quizOptions = useMemo(() => {
    if (!current || mode !== "quiz") return [] as QuizOption[];
    return buildQuizOptions(current, words);
  }, [current, mode, words]);

  useEffect(() => {
    primeArabicVoices();
    let cancelled = false;

    async function loadBatch() {
      setLoading(true);
      setFlipped(false);
      setQuizAnswer(null);
      setIndex(0);

      if (isDevMode || !dbUser?.id) {
        const response = await fetch("/api/arabic/words?pageSize=10");
        const payload = (await response.json()) as { words: ArabicWord[] };
        if (!cancelled) setWords(payload.words ?? []);
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const batch = await fetchLearnBatch(dbUser.id, 10);
        if (!cancelled) setWords(batch);
      } catch {
        if (!cancelled) setWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBatch();
    return () => {
      cancelled = true;
    };
  }, [dbUser, isDevMode]);

  async function reloadBatch() {
    setLoading(true);
    setFlipped(false);
    setQuizAnswer(null);
    setIndex(0);

    if (isDevMode || !dbUser?.id) {
      const response = await fetch("/api/arabic/words?pageSize=10");
      const payload = (await response.json()) as { words: ArabicWord[] };
      setWords(payload.words ?? []);
      setLoading(false);
      return;
    }

    try {
      const batch = await fetchLearnBatch(dbUser.id, 10);
      setWords(batch);
    } catch {
      setWords([]);
    } finally {
      setLoading(false);
    }
  }

  async function grade(result: "again" | "hard" | "good" | "easy") {
    if (!current || busy) return;
    hapticSelection();
    setBusy(true);

    if (!isDevMode && dbUser?.id) {
      try {
        const { xp } = await submitWordProgress({
          userId: dbUser.id,
          wordId: current.id,
          result,
        });
        setSessionXp((v) => v + xp);
        hapticSuccess();
      } catch {
        hapticImpact();
      }
    } else {
      setSessionXp((v) => v + (result === "easy" ? 18 : result === "good" ? 12 : 5));
    }

    setReviewed((v) => v + 1);
    setFlipped(false);
    setQuizAnswer(null);
    setBusy(false);

    if (index >= words.length - 1) {
      void reloadBatch();
    } else {
      setIndex((v) => v + 1);
    }
  }

  async function pickQuizOption(option: QuizOption) {
    if (quizAnswer || busy) return;
    hapticSelection();
    setQuizAnswer(option.text);
    await grade(option.correct ? "good" : "again");
  }

  const progressPct = useMemo(() => {
    if (words.length === 0) return 0;
    return ((index + (flipped || quizAnswer ? 1 : 0)) / words.length) * 100;
  }, [flipped, index, quizAnswer, words.length]);

  if (loading) {
    return (
      <div className={`${cozyCardClass} flex items-center justify-center gap-2 py-16 text-sm text-[var(--theme-text-muted)]`}>
        <Loader2 className="h-5 w-5 animate-spin" />
        Готовим карточки...
      </div>
    );
  }

  if (!current) {
    return (
      <div className={`${cozyCardClass} px-4 py-8 text-center`}>
        <p className="text-sm text-[var(--theme-text-muted)]">
          Слова ещё не загружены в базу. Попробуйте позже.
        </p>
        <motion.button
          type="button"
          onClick={() => void reloadBatch()}
          whileTap={{ scale: 0.96 }}
          className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
        >
          Обновить
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`${cozyCardClass} px-4 py-4`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--theme-text)]">
            Учить слова
          </p>
          <p className="text-[11px] text-[var(--theme-text-muted)]">
            Карточки и викторина · интервальное повторение
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">
          <Sparkles className="h-3 w-3" />
          {sessionXp} XP
        </div>
      </div>

      <div className="mb-3 flex gap-1 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] p-1">
        {(["flashcard", "quiz"] as LearnMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              hapticSelection();
              setMode(item);
              setFlipped(false);
              setQuizAnswer(null);
            }}
            className={`flex-1 rounded-xl py-2 text-[11px] font-semibold ${
              mode === item
                ? "bg-emerald-100 text-emerald-800"
                : "text-[var(--theme-text-muted)]"
            }`}
          >
            {item === "flashcard" ? "Карточки" : "Викторина"}
          </button>
        ))}
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[var(--theme-border)]">
        <motion.div
          className="h-full bg-emerald-500"
          animate={{ width: `${progressPct}%` }}
        />
      </div>

      <p className="mb-2 text-center text-[10px] text-[var(--theme-text-muted)]">
        {index + 1} / {words.length} · повторено {reviewed}
      </p>

      {mode === "flashcard" && (
        <motion.button
          type="button"
          onClick={() => setFlipped((v) => !v)}
          whileTap={{ scale: 0.98 }}
          className="relative mx-auto mb-4 flex min-h-[200px] w-full max-w-xs flex-col items-center justify-center rounded-3xl border border-[var(--theme-border)] bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center dark:from-emerald-950/30 dark:to-teal-950/20"
        >
          <AnimatePresence mode="wait">
            {!flipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
              >
                <span
                  dir="rtl"
                  lang="ar"
                  className="block text-4xl font-medium text-[var(--theme-text)]"
                >
                  {current.arabic}
                </span>
                <p className="mt-2 text-xs italic text-[var(--theme-text-muted)]">
                  {current.transliteration}
                </p>
                <p className="mt-3 text-[10px] text-[var(--theme-text-muted)]">
                  Нажмите, чтобы увидеть перевод
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
              >
                <p className="text-xl font-semibold text-[var(--theme-text)]">
                  {current.translation_ru}
                </p>
                <p className="mt-2 text-xs text-[var(--theme-text-muted)]">
                  {current.category}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {mode === "quiz" && (
        <div className="mb-4">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span
              dir="rtl"
              lang="ar"
              className="text-3xl text-[var(--theme-text)]"
            >
              {current.arabic}
            </span>
            <motion.button
              type="button"
              onClick={() => {
                hapticSelection();
                void playArabicAudio(current.arabic, current.audio_url);
              }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full border border-emerald-200 p-2 text-emerald-700"
            >
              <Volume2 className="h-4 w-4" />
            </motion.button>
          </div>
          <p className="mb-3 text-center text-xs text-[var(--theme-text-muted)]">
            Выберите правильный перевод
          </p>
          <ul className="grid gap-2">
            {quizOptions.map((option) => {
              const picked = quizAnswer === option.text;
              const showResult = quizAnswer !== null;
              return (
                <motion.li key={option.text}>
                  <button
                    type="button"
                    disabled={!!quizAnswer}
                    onClick={() => void pickQuizOption(option)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm ${
                      showResult && option.correct
                        ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                        : picked && !option.correct
                          ? "border-red-300 bg-red-50 text-red-800"
                          : "border-[var(--theme-border)] bg-[var(--theme-surface)]"
                    }`}
                  >
                    {option.text}
                    {showResult && option.correct && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                    {picked && !option.correct && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-center gap-1">
        <motion.button
          type="button"
          onClick={() => {
            hapticSelection();
            void playArabicAudio(current.arabic, current.audio_url);
          }}
          whileTap={{ scale: 0.9 }}
          className="rounded-full border border-[var(--theme-border)] p-2 text-emerald-700"
        >
          <Volume2 className="h-4 w-4" />
        </motion.button>
        <motion.button
          type="button"
          onClick={() => void reloadBatch()}
          whileTap={{ scale: 0.9 }}
          className="rounded-full border border-[var(--theme-border)] p-2 text-[var(--theme-text-muted)]"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>
      </div>

      {mode === "flashcard" && flipped && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(
            [
              ["again", "Снова", "border-red-200 bg-red-50 text-red-800"],
              ["hard", "Сложно", "border-orange-200 bg-orange-50 text-orange-800"],
              ["good", "Знаю", "border-emerald-200 bg-emerald-50 text-emerald-800"],
              ["easy", "Легко", "border-sky-200 bg-sky-50 text-sky-800"],
            ] as const
          ).map(([result, label, cls]) => (
            <motion.button
              key={result}
              type="button"
              disabled={busy}
              onClick={() => void grade(result)}
              whileTap={{ scale: 0.96 }}
              className={`rounded-2xl border px-2 py-2.5 text-xs font-semibold ${cls}`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      )}

      {!dbUser && !isDevMode && (
        <p className="mt-3 flex items-center justify-center gap-1 text-[10px] text-[var(--theme-text-muted)]">
          <Brain className="h-3 w-3" />
          Войдите через Telegram для сохранения прогресса
        </p>
      )}
    </div>
  );
}
