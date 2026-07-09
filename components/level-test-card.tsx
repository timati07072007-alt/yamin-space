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
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  const question = questions[questionIndex] ?? null;
  const isModalOpen = phase === "loading" || phase === "playing" || phase === "submitting" || phase === "results";

  useEffect(() => {
    setMounted(true);
  }, []);

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

        {mounted && isModalOpen
          ? createPortal(
              <AnimatePresence>{renderModal()}</AnimatePresence>,
              document.body,
            )
          : null}
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

      {mounted && isModalOpen
        ? createPortal(
            <AnimatePresence>{renderModal()}</AnimatePresence>,
            document.body,
          )
        : null}
    </section>
  );

  function renderModal() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="level-test-modal fixed inset-0 z-[100] flex h-[100dvh] max-h-[100dvh] flex-col bg-[#faf6ee]/95 backdrop-blur-md"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-stone-200/80 px-3 py-2">
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

        <div className="flex min-h-0 flex-1 flex-col justify-center px-3 py-2">
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
              className="mx-auto flex min-h-0 w-full max-w-md flex-col gap-2 pt-0.5"
            >
              <div className="shrink-0 space-y-1">
                <div className="h-1 overflow-hidden rounded-full bg-stone-200/70">
                  <motion.div
                    animate={{
                      width: `${((questionIndex + 1) / questions.length) * 100}%`,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                  />
                </div>

                <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                  Вопрос {questionIndex + 1} из {questions.length}
                </p>

                <p className="line-clamp-3 text-xs font-medium leading-snug text-stone-800">
                  {question.question_text}
                </p>
              </div>

              <ul className="flex flex-col gap-1">
                {question.options.map((option, index) => (
                  <li key={index}>
                    <motion.button
                      type="button"
                      onClick={() => selectAnswer(index)}
                      whileTap={{ scale: 0.98 }}
                      className={`flex min-h-[2.1rem] w-full items-center rounded-xl border px-2.5 py-1.5 text-left text-[11px] leading-tight transition-colors ${
                        selectedIndex === index
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-stone-200/80 bg-white/90 text-stone-700"
                      }`}
                    >
                      <span className="line-clamp-2">{option}</span>
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
              className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col justify-between gap-3 py-1"
            >
              <div className="shrink-0 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-amber-100/80 text-amber-600">
                  <Award className="h-7 w-7" />
                </div>

                <h3 className="mt-3 text-lg font-semibold text-stone-800">
                  Тест завершён!
                </h3>
                <p className="mt-0.5 text-xs text-stone-500">
                  Правильных ответов: {score} из {questions.length}
                </p>

                <p
                  className={`mx-auto mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${TITLE_STYLES[resultTitle]}`}
                >
                  {resultTitle}
                </p>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                  <div className="mb-0.5 flex items-center justify-center gap-1 text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase">XP</span>
                  </div>
                  <p className="text-xl font-semibold text-stone-800">
                    +{xpAwarded}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                  <div className="mb-0.5 flex items-center justify-center gap-1 text-amber-600">
                    <Coins className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase">Монеты</span>
                  </div>
                  <p className="text-xl font-semibold text-stone-800">
                    +{coinsAwarded}
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={closeModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="shrink-0 w-full rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white"
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
