"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Coins,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import {
  DEV_QUIZZES,
  fetchDevQuizQuestions,
  fetchQuizQuestions,
  fetchQuizzes,
  submitDevQuizAnswer,
  submitQuizAnswer,
  type Quiz,
  type QuizQuestion,
  type SubmitAnswerResult,
} from "@/lib/quiz";

type WizardStep = "topics" | "playing" | "results";

type AnswerState = "idle" | "submitting" | "revealed";

interface QuizProgress {
  correctCount: number;
  xpEarned: number;
  coinsEarned: number;
}

const EMPTY_PROGRESS: QuizProgress = {
  correctCount: 0,
  xpEarned: 0,
  coinsEarned: 0,
};

const DIFFICULTY_LABELS: Record<Quiz["difficulty"], string> = {
  easy: "Лёгкий",
  medium: "Средний",
  hard: "Сложный",
};

const glassCard =
  "w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl";

function useCountUp(target: number, durationMs: number): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, durationMs]);

  return value;
}

export function QuizWizard() {
  const { dbUser, isDevMode, refreshUser, patchUser } = useTelegram();

  const [step, setStep] = useState<WizardStep>("topics");
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<SubmitAnswerResult | null>(null);
  const [progress, setProgress] = useState<QuizProgress>(EMPTY_PROGRESS);

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadQuizzes() {
      try {
        const list = isDevMode ? DEV_QUIZZES : await fetchQuizzes();

        if (!cancelled) {
          setQuizzes(list);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Не удалось загрузить темы",
          );
        }
      }
    }

    void loadQuizzes();

    return () => {
      cancelled = true;
    };
  }, [isDevMode]);

  async function startQuiz(quiz: Quiz) {
    setLoadError(null);

    try {
      const loaded = isDevMode
        ? await fetchDevQuizQuestions(quiz.id)
        : await fetchQuizQuestions(quiz.id);

      if (loaded.length === 0) {
        setLoadError("В этой теме пока нет вопросов");
        return;
      }

      setActiveQuiz(quiz);
      setQuestions(loaded);
      setQuestionIndex(0);
      setProgress(EMPTY_PROGRESS);
      setAnswerState("idle");
      setSelectedIndex(null);
      setLastResult(null);
      setClaimed(false);
      setStep("playing");
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Не удалось загрузить вопросы",
      );
    }
  }

  async function handleAnswer(optionIndex: number) {
    if (answerState !== "idle" || !dbUser) {
      return;
    }

    const question = questions[questionIndex];

    setSelectedIndex(optionIndex);
    setAnswerState("submitting");

    try {
      const result = isDevMode
        ? await submitDevQuizAnswer(question.id, optionIndex)
        : await submitQuizAnswer(dbUser.id, question.id, optionIndex);

      setLastResult(result);
      setAnswerState("revealed");

      if (result.correct) {
        setProgress((current) => ({
          correctCount: current.correctCount + 1,
          xpEarned: current.xpEarned + result.xpAwarded,
          coinsEarned: current.coinsEarned + result.coinsAwarded,
        }));
      }
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Не удалось отправить ответ",
      );
      setAnswerState("idle");
      setSelectedIndex(null);
    }
  }

  function goNext() {
    if (questionIndex + 1 >= questions.length) {
      setStep("results");
      return;
    }

    setQuestionIndex((current) => current + 1);
    setAnswerState("idle");
    setSelectedIndex(null);
    setLastResult(null);
  }

  async function claimReward() {
    setIsClaiming(true);

    try {
      if (isDevMode && dbUser) {
        patchUser({
          xp: dbUser.xp + progress.xpEarned,
          coins: dbUser.coins + progress.coinsEarned,
        });
      } else {
        await refreshUser();
      }

      setClaimed(true);
    } finally {
      setIsClaiming(false);
    }
  }

  function restart() {
    setStep("topics");
    setActiveQuiz(null);
    setQuestions([]);
    setProgress(EMPTY_PROGRESS);
    setClaimed(false);
  }

  const question = questions[questionIndex] ?? null;

  return (
    <section className={glassCard}>
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
            Викторина
          </h2>
          <p className="text-xs text-zinc-500">
            Отвечай на вопросы — получай XP и монеты
          </p>
        </div>
      </div>

      <div className="px-5 py-5">
        {loadError && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {loadError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "topics" && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {!quizzes ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Загружаем темы...
                </div>
              ) : (
                <ul className="space-y-2">
                  {quizzes.map((quiz) => (
                    <li key={quiz.id}>
                      <motion.button
                        type="button"
                        onClick={() => void startQuiz(quiz)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5 text-left transition-colors hover:border-emerald-400/25 hover:bg-emerald-500/10"
                      >
                        <span>
                          <span className="block text-sm font-medium text-zinc-100">
                            {quiz.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-zinc-500">
                            {quiz.category} · {DIFFICULTY_LABELS[quiz.difficulty]}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
                      </motion.button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {step === "playing" && question && activeQuiz && (
            <motion.div
              key={`question-${question.id}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{activeQuiz.title}</span>
                  <span className="tabular-nums">
                    {questionIndex + 1} из {questions.length}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={false}
                    animate={{
                      width: `${((questionIndex + (answerState === "revealed" ? 1 : 0)) / questions.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300"
                  />
                </div>
              </div>

              <p className="mb-4 text-base font-medium leading-snug text-zinc-100">
                {question.question_text}
              </p>

              <ul className="space-y-2">
                {question.options.map((option, index) => {
                  const isSelected = selectedIndex === index;
                  const isCorrectOption =
                    answerState === "revealed" &&
                    lastResult !== null &&
                    lastResult.correctOptionIndex === index;
                  const isWrongSelection =
                    answerState === "revealed" &&
                    isSelected &&
                    lastResult !== null &&
                    !lastResult.correct;

                  let optionClass =
                    "border-white/5 bg-white/5 text-zinc-200 hover:border-emerald-400/25 hover:bg-emerald-500/10";

                  if (isCorrectOption) {
                    optionClass =
                      "border-emerald-400/40 bg-emerald-500/20 text-emerald-100";
                  } else if (isWrongSelection) {
                    optionClass = "border-red-400/40 bg-red-500/20 text-red-200";
                  } else if (answerState === "revealed") {
                    optionClass = "border-white/5 bg-white/5 text-zinc-500";
                  }

                  return (
                    <li key={index}>
                      <motion.button
                        type="button"
                        disabled={answerState !== "idle"}
                        onClick={() => void handleAnswer(index)}
                        whileHover={
                          answerState === "idle" ? { scale: 1.01 } : undefined
                        }
                        whileTap={
                          answerState === "idle" ? { scale: 0.99 } : undefined
                        }
                        animate={
                          isCorrectOption
                            ? { scale: [1, 1.04, 1] }
                            : isWrongSelection
                              ? { x: [0, -8, 8, -5, 5, 0] }
                              : undefined
                        }
                        transition={{ duration: 0.45 }}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${optionClass}`}
                      >
                        <span>{option}</span>
                        {isSelected && answerState === "submitting" && (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        )}
                        {isCorrectOption && (
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                        )}
                        {isWrongSelection && (
                          <XCircle className="h-4 w-4 shrink-0" />
                        )}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>

              <AnimatePresence>
                {answerState === "revealed" && lastResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    {lastResult.alreadyAnswered && (
                      <p className="mb-2 text-xs text-amber-300/80">
                        Ты уже отвечал на этот вопрос — награда не начисляется.
                      </p>
                    )}
                    <motion.button
                      type="button"
                      onClick={goNext}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 px-4 py-3 text-sm font-semibold text-emerald-50 transition-colors hover:from-emerald-500 hover:to-emerald-600"
                    >
                      {questionIndex + 1 >= questions.length
                        ? "К результатам"
                        : "Следующий вопрос"}
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === "results" && (
            <ResultsScreen
              key="results"
              progress={progress}
              totalQuestions={questions.length}
              claimed={claimed}
              isClaiming={isClaiming}
              onClaim={() => void claimReward()}
              onRestart={restart}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

interface ResultsScreenProps {
  progress: QuizProgress;
  totalQuestions: number;
  claimed: boolean;
  isClaiming: boolean;
  onClaim: () => void;
  onRestart: () => void;
}

function ResultsScreen({
  progress,
  totalQuestions,
  claimed,
  isClaiming,
  onClaim,
  onRestart,
}: ResultsScreenProps) {
  const animatedXp = useCountUp(progress.xpEarned, 1200);
  const animatedCoins = useCountUp(progress.coinsEarned, 1200);

  const hasReward = progress.xpEarned > 0 || progress.coinsEarned > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300"
      >
        <Award className="h-8 w-8" />
      </motion.div>

      <h3 className="mt-4 text-lg font-semibold text-zinc-50">
        Викторина пройдена!
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        Правильных ответов: {progress.correctCount} из {totalQuestions}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-emerald-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              XP
            </span>
          </div>
          <p className="text-2xl font-semibold text-zinc-50 tabular-nums">
            +{animatedXp}
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-amber-300">
            <Coins className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Монеты
            </span>
          </div>
          <p className="text-2xl font-semibold text-zinc-50 tabular-nums">
            +{animatedCoins}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {!claimed && hasReward && (
          <motion.button
            type="button"
            onClick={onClaim}
            disabled={isClaiming}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/80 to-amber-600/80 px-4 py-3.5 text-sm font-semibold text-amber-50 shadow-[0_8px_32px_-8px_rgba(245,158,11,0.5)] transition-colors hover:from-amber-500 hover:to-amber-600 disabled:opacity-60"
          >
            {isClaiming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Award className="h-4 w-4" />
            )}
            Забрать награду
          </motion.button>
        )}

        {claimed && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            Награда зачислена на баланс!
          </motion.p>
        )}

        <motion.button
          type="button"
          onClick={onRestart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Выбрать другую тему
        </motion.button>
      </div>
    </motion.div>
  );
}
