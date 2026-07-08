"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Coins,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import { fireCelebrationConfetti } from "@/lib/confetti";
import {
  fetchDailyQuiz,
  fetchDevDailyQuiz,
  submitDevQuizAnswer,
  submitQuizAnswer,
  type QuizQuestion,
  type SubmitAnswerResult,
} from "@/lib/quiz";

const cozyCard =
  "w-full max-w-sm overflow-hidden rounded-[2rem] border border-amber-900/10 bg-white/75 shadow-[0_20px_50px_-24px_rgba(146,104,41,0.35)] backdrop-blur-xl";

type Step = "loading" | "playing" | "done";

type AnswerState = "idle" | "submitting" | "revealed";

export function DailyQuiz() {
  const { dbUser, isDevMode, refreshUser, patchUser } = useTelegram();

  const [step, setStep] = useState<Step>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<SubmitAnswerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loaded = isDevMode
          ? await fetchDevDailyQuiz()
          : await fetchDailyQuiz();

        if (!cancelled) {
          setQuestions(loaded);
          setStep(loaded.length > 0 ? "playing" : "done");
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Не удалось загрузить квиз дня",
          );
          setStep("done");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [isDevMode]);

  const question = questions[questionIndex] ?? null;

  async function handleAnswer(optionIndex: number) {
    if (answerState !== "idle" || !dbUser || !question) {
      return;
    }

    setSelectedIndex(optionIndex);
    setAnswerState("submitting");

    try {
      const result = isDevMode
        ? await submitDevQuizAnswer(question.id, optionIndex)
        : await submitQuizAnswer(dbUser.id, question.id, optionIndex);

      setLastResult(result);
      setAnswerState("revealed");

      if (result.correct) {
        setCorrectCount((value) => value + 1);
        setXpEarned((value) => value + result.xpAwarded);
        setCoinsEarned((value) => value + result.coinsAwarded);
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Не удалось отправить ответ",
      );
      setAnswerState("idle");
      setSelectedIndex(null);
    }
  }

  function goNext() {
    if (questionIndex + 1 >= questions.length) {
      setStep("done");
      fireCelebrationConfetti();
      return;
    }

    setQuestionIndex((value) => value + 1);
    setAnswerState("idle");
    setSelectedIndex(null);
    setLastResult(null);
  }

  async function claimDailyReward() {
    if (rewardClaimed) {
      return;
    }

    if (isDevMode && dbUser) {
      patchUser({
        xp: dbUser.xp + xpEarned,
        coins: dbUser.coins + coinsEarned,
      });
    } else {
      await refreshUser();
    }

    setRewardClaimed(true);
    fireCelebrationConfetti();
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 260, damping: 22 },
      }}
      className={cozyCard}
    >
      <div className="flex items-center gap-3 border-b border-stone-200/70 px-5 py-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100/80 text-emerald-700">
          <BrainCircuit className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stone-700">Квиз дня</h2>
          <p className="text-xs text-stone-400">3 вопроса · XP и монеты</p>
        </div>
      </div>

      <div className="px-5 py-4">
        {error && (
          <p className="mb-3 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {step === "loading" && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-stone-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Подбираем вопросы...
          </div>
        )}

        {step === "playing" && question && (
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28 }}
            >
              <div className="mb-3 flex items-center justify-between text-xs text-stone-400">
                <span>Сегодняшний квиз</span>
                <span className="tabular-nums">
                  {questionIndex + 1} / {questions.length}
                </span>
              </div>

              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-stone-200/70">
                <motion.div
                  initial={false}
                  animate={{
                    width: `${((questionIndex + (answerState === "revealed" ? 1 : 0)) / questions.length) * 100}%`,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                />
              </div>

              <p className="mb-4 text-sm font-medium leading-snug text-stone-800">
                {question.question_text}
              </p>

              <ul className="space-y-2">
                {question.options.map((option, index) => {
                  const isSelected = selectedIndex === index;
                  const isCorrect =
                    answerState === "revealed" &&
                    lastResult?.correctOptionIndex === index;
                  const isWrong =
                    answerState === "revealed" &&
                    isSelected &&
                    lastResult &&
                    !lastResult.correct;

                  let className =
                    "border-stone-200/80 bg-white/70 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50";

                  if (isCorrect) {
                    className =
                      "border-emerald-300 bg-emerald-100/80 text-emerald-800";
                  } else if (isWrong) {
                    className = "border-red-300 bg-red-50 text-red-700";
                  } else if (answerState === "revealed") {
                    className = "border-stone-200 bg-stone-50 text-stone-400";
                  }

                  return (
                    <li key={index}>
                      <motion.button
                        type="button"
                        disabled={answerState !== "idle"}
                        onClick={() => void handleAnswer(index)}
                        whileHover={
                          answerState === "idle" ? { scale: 1.02 } : undefined
                        }
                        whileTap={
                          answerState === "idle" ? { scale: 0.98 } : undefined
                        }
                        className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${className}`}
                      >
                        <span>{option}</span>
                        {isCorrect && (
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                        )}
                        {isWrong && (
                          <XCircle className="h-4 w-4 shrink-0" />
                        )}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>

              {answerState === "revealed" && (
                <motion.button
                  type="button"
                  onClick={goNext}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  {questionIndex + 1 >= questions.length
                    ? "Итоги"
                    : "Дальше"}
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-sm font-medium text-stone-700">
              {questions.length === 0
                ? "Вопросы квиза пока недоступны"
                : "Квиз дня завершён!"}
            </p>
            {questions.length > 0 && (
              <>
                <p className="mt-1 text-xs text-stone-400">
                  Правильных ответов: {correctCount} из {questions.length}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <div className="mb-1 flex items-center justify-center gap-1 text-emerald-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-medium uppercase">
                        XP
                      </span>
                    </div>
                    <p className="text-xl font-semibold text-stone-800">
                      +{xpEarned}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-3">
                    <div className="mb-1 flex items-center justify-center gap-1 text-amber-600">
                      <Coins className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-medium uppercase">
                        Монеты
                      </span>
                    </div>
                    <p className="text-xl font-semibold text-stone-800">
                      +{coinsEarned}
                    </p>
                  </div>
                </div>
                {!rewardClaimed && (xpEarned > 0 || coinsEarned > 0) && (
                  <motion.button
                    type="button"
                    onClick={() => void claimDailyReward()}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-4 w-full rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Забрать награду
                  </motion.button>
                )}
                {rewardClaimed && (
                  <p className="mt-3 text-xs font-medium text-emerald-700">
                    Награда зачислена!
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
