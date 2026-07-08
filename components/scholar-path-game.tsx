"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  MapPin,
  RotateCcw,
  Skull,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import {
  fetchAcademyQuestions,
  fetchDevAcademyQuestions,
  shuffleQuestions,
  submitDevAcademyAnswer,
  type AcademyDifficulty,
} from "@/lib/academy-quiz";
import { cozyCardClass, springPop } from "@/lib/animations";
import { fireCelebrationConfetti } from "@/lib/confetti";
import { hapticError, hapticSuccess } from "@/lib/haptic";
import {
  submitQuizAnswer,
  type QuizQuestion,
} from "@/lib/quiz";

const MAP_NODES = 8;
const MAX_LIVES = 3;

interface ScholarPathGameProps {
  difficulty: AcademyDifficulty;
  onBack: () => void;
}

export function ScholarPathGame({ difficulty, onBack }: ScholarPathGameProps) {
  const { dbUser, isDevMode, patchUser, refreshUser } = useTelegram();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [lostHeart, setLostHeart] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const loaded = isDevMode
        ? await fetchDevAcademyQuestions(difficulty, 20)
        : await fetchAcademyQuestions(difficulty, 20);

      if (!cancelled) {
        setQuestions(shuffleQuestions(loaded).slice(0, MAP_NODES));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDevMode, difficulty]);

  function restart() {
    setLevel(0);
    setLives(MAX_LIVES);
    setQIndex(0);
    setSelected(null);
    setFinished(false);
    setWon(false);
    setLostHeart(null);
    setQuestions((prev) => shuffleQuestions(prev));
  }

  const question = questions[qIndex] ?? null;

  async function answer(optionIndex: number) {
    if (!question || selected !== null || !dbUser) return;

    setSelected(optionIndex);

    const result = isDevMode
      ? await submitDevAcademyAnswer(question.id, optionIndex)
      : await submitQuizAnswer(dbUser.id, question.id, optionIndex);

    window.setTimeout(async () => {
      if (result.correct) {
        hapticSuccess();
        const nextLevel = level + 1;
        setLevel(nextLevel);

        if (qIndex + 1 >= questions.length) {
          setFinished(true);
          setWon(true);
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
        hapticError();
        const nextLives = lives - 1;
        setLostHeart(nextLives);
        setLives(nextLives);

        if (nextLives <= 0) {
          setFinished(true);
          setWon(false);
          setSelected(null);
          return;
        }
      }

      setSelected(null);
      window.setTimeout(() => setLostHeart(null), 500);
    }, 650);
  }

  if (loading) {
    return (
      <div
        className={`${cozyCardClass} px-5 py-10 text-center text-sm text-stone-400`}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          Строим карту пути учёного...
        </motion.div>
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

      <div className="mb-2 flex items-center gap-2">
        <Skull className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-semibold text-stone-800">Путь учёного</span>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <motion.div
              key={i}
              animate={
                lostHeart === i
                  ? { scale: [1, 1.4, 0], opacity: [1, 1, 0], rotate: [0, 15, -15] }
                  : { scale: 1, opacity: i < lives ? 1 : 0.25 }
              }
              transition={{ duration: 0.45 }}
            >
              <Heart
                className={`h-5 w-5 ${
                  i < lives ? "fill-rose-400 text-rose-400" : "text-stone-300"
                }`}
              />
            </motion.div>
          ))}
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          Уровень {Math.min(level + 1, MAP_NODES)}/{MAP_NODES}
        </span>
      </div>

      <div className="relative mb-5 h-2 overflow-hidden rounded-full bg-stone-200/70">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-violet-400"
          animate={{ width: `${(level / MAP_NODES) * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        />
      </div>

      <div className="mb-5 flex justify-between px-0.5">
        {Array.from({ length: MAP_NODES }, (_, i) => (
          <motion.div
            key={i}
            animate={i === level && !finished ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <MapPin
              className={`h-5 w-5 ${
                i < level
                  ? "fill-emerald-500 text-emerald-600"
                  : i === level && !finished
                    ? "text-amber-500"
                    : "text-stone-300"
              }`}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {finished ? (
          <motion.div
            key="done"
            {...springPop}
            className="py-4 text-center"
          >
            <p className="text-sm font-semibold text-stone-800">
              {won
                ? "Путь пройден! Машаллах!"
                : "Жизни закончились..."}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {won && difficulty === "hardcore"
                ? "Хардкор пройден — проверьте алмазы 💎"
                : won
                  ? "Продолжайте учиться каждый день"
                  : "Попробуйте снова — знания приходят с практикой"}
            </p>
            <motion.button
              type="button"
              onClick={restart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="mt-4 inline-flex items-center gap-2 rounded-3xl border border-emerald-300 bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Заново
            </motion.button>
          </motion.div>
        ) : question ? (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <p className="mb-3 text-sm font-medium leading-snug text-stone-800">
              {question.question_text}
            </p>
            <ul className="space-y-2">
              {question.options.map((opt, index) => {
                let cls =
                  "border-stone-200/80 bg-white/90 text-stone-700 hover:border-emerald-200";

                if (selected === index) {
                  cls = "border-emerald-300 bg-emerald-50 text-emerald-800";
                }

                return (
                  <li key={index}>
                    <motion.button
                      type="button"
                      disabled={selected !== null}
                      onClick={() => void answer(index)}
                      whileHover={selected === null ? { scale: 1.02 } : undefined}
                      whileTap={selected === null ? { scale: 0.97 } : undefined}
                      className={`w-full rounded-3xl border px-4 py-3 text-left text-sm ${cls}`}
                    >
                      {opt}
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : (
          <p className="py-6 text-center text-xs text-stone-400">
            <Sparkles className="mx-auto mb-2 h-5 w-5" />
            Вопросы для этого уровня скоро появятся
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
