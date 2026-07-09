"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BrainCircuit,
  ChevronRight,
  Coins,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import { fireCelebrationConfetti } from "@/lib/confetti";
import {
  fetchAcademyQuestions,
  fetchDevAcademyQuestions,
  shuffleQuestions,
  submitDevAcademyAnswer,
  type AcademyDifficulty,
} from "@/lib/academy-quiz";
import { resolveKnowledgeTitle, type KnowledgeTitle } from "@/lib/level-test";
import {
  submitQuizAnswer,
  type QuizQuestion,
} from "@/lib/quiz";

const cozyCard =
  "w-full max-w-sm overflow-hidden rounded-[2rem] border border-amber-900/10 bg-white/75 shadow-[0_20px_50px_-24px_rgba(146,104,41,0.35)] backdrop-blur-xl";

const TITLE_STYLES: Record<KnowledgeTitle, string> = {
  Новичок: "border-stone-200 bg-stone-50 text-stone-600",
  Знаток: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Мудрец: "border-amber-200 bg-amber-50 text-amber-800",
};

type Phase = "idle" | "loading" | "playing" | "submitting" | "results";

interface LevelTestCardProps {
  compact?: boolean;
  difficulty?: AcademyDifficulty;
}

export function LevelTestCard({
  compact = false,
  difficulty = "easy",
}: LevelTestCardProps) {
  const { dbUser, isDevMode, refreshUser, patchUser } = useTelegram();

  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{ questionId: number; correct: boolean }>
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultTitle, setResultTitle] = useState<KnowledgeTitle | null>(null);
  const [score, setScore] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [coinsAwarded, setCoinsAwarded] = useState(0);

  const question = questions[questionIndex] ?? null;
  const isModalOpen = phase === "loading" || phase === "playing" || phase === "submitting" || phase === "results";

  useEffect(() => {
    if (!isModalOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  async function startTest() {
    setPhase("loading");
    setError(null);
    setAnswers([]);
    setQuestionIndex(0);
    setSelectedIndex(null);

    try {
      const loaded = isDevMode
        ? await fetchDevAcademyQuestions(difficulty, 20)
        : await fetchAcademyQuestions(difficulty, 20);

      const picked = shuffleQuestions(loaded).slice(0, 10);

      if (picked.length === 0) {
        setError("Вопросы теста пока недоступны");
        setPhase("idle");
        return;
      }

      setQuestions(picked);
      setPhase("playing");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Не удалось загрузить тест",
      );
      setPhase("idle");
    }
  }

  async function selectAnswer(optionIndex: number) {
    if (!question || phase !== "playing" || !dbUser) {
      return;
    }

    setSelectedIndex(optionIndex);

    const result = isDevMode
      ? await submitDevAcademyAnswer(question.id, optionIndex)
      : await submitQuizAnswer(dbUser.id, question.id, optionIndex);

    const nextAnswers = [
      ...answers.filter((item) => item.questionId !== question.id),
      { questionId: question.id, correct: result.correct },
    ];

    setAnswers(nextAnswers);

    if (questionIndex + 1 >= questions.length) {
      void finishTest(nextAnswers);
      return;
    }

    setTimeout(() => {
      setQuestionIndex((value) => value + 1);
      setSelectedIndex(null);
    }, 280);
  }

  async function finishTest(
    finalAnswers: Array<{ questionId: number; correct: boolean }>,
  ) {
    if (!dbUser) {
      return;
    }

    setPhase("submitting");

    try {
      const score = finalAnswers.filter((a) => a.correct).length;
      const total = questions.length;
      const title = resolveKnowledgeTitle(score, total);
      const xpAwarded = score * (difficulty === "hardcore" ? 12 : difficulty === "medium" ? 10 : 8);
      const coinsAwarded = score * (difficulty === "hardcore" ? 6 : difficulty === "medium" ? 5 : 4);

      setScore(score);
      setResultTitle(title);
      setXpAwarded(xpAwarded);
      setCoinsAwarded(coinsAwarded);
      setPhase("results");

      if (isDevMode) {
        patchUser({
          title,
          xp: dbUser.xp + xpAwarded,
          coins: dbUser.coins + coinsAwarded,
          ...(difficulty === "hardcore" && score >= total * 0.8
            ? { diamonds: dbUser.diamonds + 1 }
            : {}),
        });
      } else {
        if (difficulty === "hardcore" && score >= total * 0.8) {
          await fetch("/api/gamification/reward", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: dbUser.id,
              xpAwarded,
              diamondAward: 1,
            }),
          });
        }
        await refreshUser();
      }

      fireCelebrationConfetti();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Не удалось отправить тест",
      );
      setPhase("idle");
    }
  }

  function closeModal() {
    setPhase("idle");
    setQuestions([]);
    setQuestionIndex(0);
    setSelectedIndex(null);
    setResultTitle(null);
  }

  if (compact) {
    return (
      <>
        <motion.button
          type="button"
          onClick={() => void startTest()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center gap-3 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-3.5 text-left shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100/80 text-amber-700">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-800">
              Тест на уровень знаний
            </p>
            <p className="text-xs text-stone-400">10 вопросов · обновит ваш статус</p>
          </div>
          <ChevronRight className="h-4 w-4 text-stone-400" />
        </motion.button>

        <AnimatePresence>{isModalOpen && renderModal()}</AnimatePresence>
      </>
    );
  }

  return (
    <section className={cozyCard}>
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100/80 text-amber-700">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-stone-700">
              Тест на уровень знаний
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-stone-400">
              10 вопросов определят ваш статус: Новичок, Знаток или Мудрец.
            </p>
            <motion.button
              type="button"
              onClick={() => void startTest()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-3 rounded-full border border-emerald-300 bg-emerald-100/80 px-4 py-2 text-xs font-semibold text-emerald-800"
            >
              Пройти тест
            </motion.button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-xs text-red-500">{error}</p>
        )}
      </div>

      <AnimatePresence>{isModalOpen && renderModal()}</AnimatePresence>
    </section>
  );

  function renderModal() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="level-test-modal fixed inset-0 z-[70] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#faf6ee]/95 backdrop-blur-md"
      >
        <div className="flex shrink-0 items-center gap-2.5 border-b border-stone-200/80 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-100/80 text-amber-700">
            <Award className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-stone-800">
              Тест на уровень знаний
            </h2>
            <p className="text-[11px] text-stone-400">
              {phase === "results"
                ? "Результаты"
                : `Вопрос ${Math.min(questionIndex + 1, questions.length)} из ${questions.length}`}
            </p>
          </div>
          <motion.button
            type="button"
            onClick={closeModal}
            whileTap={{ scale: 0.9 }}
            aria-label="Закрыть"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3">
          {(phase === "loading" || phase === "submitting") && (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-stone-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              {phase === "loading" ? "Готовим вопросы..." : "Считаем результат..."}
            </div>
          )}

          {phase === "playing" && question && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col"
            >
              <div className="mb-2 h-1 shrink-0 overflow-hidden rounded-full bg-stone-200/70">
                <motion.div
                  animate={{
                    width: `${((questionIndex + 1) / questions.length) * 100}%`,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                />
              </div>

              <p className="mb-2 line-clamp-4 shrink-0 text-[13px] font-medium leading-snug text-stone-800">
                {question.question_text}
              </p>

              <ul className="flex min-h-0 flex-1 flex-col justify-center gap-1.5">
                {question.options.map((option, index) => (
                  <li key={index} className="shrink-0">
                    <motion.button
                      type="button"
                      onClick={() => selectAnswer(index)}
                      whileTap={{ scale: 0.98 }}
                      className={`flex w-full rounded-2xl border px-3 py-2.5 text-left text-[13px] leading-snug transition-colors ${
                        selectedIndex === index
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-stone-200/80 bg-white/90 text-stone-700"
                      }`}
                    >
                      {option}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {phase === "results" && resultTitle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto flex h-full w-full max-w-md flex-col justify-center text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-100/80 text-amber-600">
                <Award className="h-8 w-8" />
              </div>

              <h3 className="mt-4 text-xl font-semibold text-stone-800">
                Тест завершён!
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Правильных ответов: {score} из {questions.length}
              </p>

              <p
                className={`mx-auto mt-4 inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold ${TITLE_STYLES[resultTitle]}`}
              >
                {resultTitle}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="mb-1 flex items-center justify-center gap-1 text-emerald-700">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs uppercase">XP</span>
                  </div>
                  <p className="text-2xl font-semibold text-stone-800">
                    +{xpAwarded}
                  </p>
                </div>
                <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
                  <div className="mb-1 flex items-center justify-center gap-1 text-amber-600">
                    <Coins className="h-4 w-4" />
                    <span className="text-xs uppercase">Монеты</span>
                  </div>
                  <p className="text-2xl font-semibold text-stone-800">
                    +{coinsAwarded}
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={closeModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white"
              >
                Отлично!
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }
}
