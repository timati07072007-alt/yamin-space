"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import { fireCelebrationConfetti } from "@/lib/confetti";
import { cozyCardClass } from "@/lib/animations";
import {
  fetchDevLevelTestQuestions,
  fetchLevelTestQuestions,
} from "@/lib/level-test";
import {
  submitDevQuizAnswer,
  submitQuizAnswer,
  type QuizQuestion,
} from "@/lib/quiz";

const MAP_NODES = 8;

interface ScholarPathGameProps {
  difficulty: "easy" | "medium" | "hardcore";
  onBack: () => void;
}

export function ScholarPathGame({ difficulty, onBack }: ScholarPathGameProps) {
  const { dbUser, isDevMode, patchUser, refreshUser } = useTelegram();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const loaded = isDevMode
        ? await fetchDevLevelTestQuestions()
        : await fetchLevelTestQuestions();

      if (!cancelled) {
        setQuestions(loaded.slice(0, MAP_NODES));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDevMode]);

  const question = questions[qIndex] ?? null;

  async function answer(optionIndex: number) {
    if (!question || selected !== null || !dbUser) return;

    setSelected(optionIndex);

    const result = isDevMode
      ? await submitDevQuizAnswer(question.id, optionIndex)
      : await submitQuizAnswer(dbUser.id, question.id, optionIndex);

    window.setTimeout(async () => {
      if (result.correct) {
        const nextLevel = level + 1;
        setLevel(nextLevel);

        if (qIndex + 1 >= questions.length) {
          setFinished(true);
          fireCelebrationConfetti();

          if (difficulty === "hardcore") {
            if (isDevMode) {
              patchUser({
                diamonds: dbUser.diamonds + 1,
                xp: dbUser.xp + 40,
                weekly_xp: dbUser.weekly_xp + 40,
              });
            } else {
              await fetch("/api/gamification/reward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: dbUser.id,
                  xpAwarded: 40,
                  diamondAward: 1,
                }),
              });
              await refreshUser();
            }
          }
          return;
        }

        setQIndex((v) => v + 1);
      } else {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          setFinished(true);
          return;
        }
      }

      setSelected(null);
    }, 600);
  }

  if (loading) {
    return (
      <div className={`${cozyCardClass} px-5 py-10 text-center text-sm text-stone-400`}>
        Строим карту пути учёного...
      </div>
    );
  }

  return (
    <div className={`${cozyCardClass} px-4 py-4`}>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 flex items-center gap-1 text-xs font-medium text-emerald-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Назад в Академию
      </button>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <Heart
              key={i}
              className={`h-4 w-4 ${
                i < lives ? "fill-red-400 text-red-400" : "text-stone-300"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-stone-500">
          Уровень {Math.min(level + 1, MAP_NODES)} / {MAP_NODES}
        </span>
      </div>

      <div className="mb-4 flex justify-between px-1">
        {Array.from({ length: MAP_NODES }, (_, i) => (
          <MapPin
            key={i}
            className={`h-4 w-4 ${
              i <= level ? "text-emerald-600" : "text-stone-300"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {finished ? (
          <motion.p
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 text-center text-sm font-medium text-stone-700"
          >
            {lives > 0
              ? "Путь пройден! Награда начислена."
              : "Жизни закончились. Попробуйте снова!"}
          </motion.p>
        ) : question ? (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <p className="mb-3 text-sm font-medium text-stone-800">
              {question.question_text}
            </p>
            <ul className="space-y-2">
              {question.options.map((opt, index) => (
                <li key={index}>
                  <motion.button
                    type="button"
                    disabled={selected !== null}
                    onClick={() => void answer(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-3xl border px-4 py-3 text-left text-sm ${
                      selected === index
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-stone-200 bg-white/80"
                    }`}
                  >
                    {opt}
                  </motion.button>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
