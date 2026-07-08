"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Star,
  Volume2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { speakArabicLetter } from "@/lib/arabic-alphabet";
import {
  ARABIC_MODULE_LABELS,
  buildModuleSteps,
  type ArabicModuleId,
  type LessonStep,
} from "@/lib/arabic-modules";
import { cozyCardClass } from "@/lib/animations";
import { hapticError, hapticSelection, hapticSuccess } from "@/lib/haptic";

interface ArabicLessonsProps {
  module: ArabicModuleId;
}

export function ArabicLessons({ module }: ArabicLessonsProps) {
  const steps = useMemo(() => buildModuleSteps(module), [module]);
  const [stepIndex, setStepIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [xp, setXp] = useState(0);

  const step = steps[stepIndex];
  const progress = stepIndex / Math.max(steps.length - 1, 1);
  const moduleMeta = ARABIC_MODULE_LABELS[module];

  function next(correct = true) {
    if (correct) {
      hapticSuccess();
      setXp((v) => v + 10);
    } else {
      hapticError();
    }
    setFlipped(false);
    setPicked(null);
    setStepIndex((v) => Math.min(v + 1, steps.length - 1));
  }

  function pick(option: string) {
    if (picked) return;
    hapticSelection();
    setPicked(option);
    window.setTimeout(() => next(option === step.correct), 700);
  }

  return (
    <div className={`${cozyCardClass} overflow-hidden`}>
      <div className="border-b border-[var(--theme-border)] bg-gradient-to-r from-[var(--theme-accent-soft)] via-[var(--theme-surface)] to-[var(--theme-accent-soft)] px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--theme-accent-text)]">
            {moduleMeta.emoji} {moduleMeta.title}
          </span>
          <span className="flex items-center gap-1 text-[var(--theme-gold-text)]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {xp} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--theme-muted)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          />
        </div>
      </div>

      <div className="px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${module}-${step.id}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <StepContent
              step={step}
              flipped={flipped}
              picked={picked}
              xp={xp}
              onNext={next}
              onFlip={() => {
                hapticSelection();
                setFlipped((v) => !v);
                if (!flipped && step.letter) {
                  speakArabicLetter(step.letter.speech);
                }
              }}
              onPick={pick}
              onRestart={() => {
                setStepIndex(0);
                setXp(0);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepContent({
  step,
  flipped,
  picked,
  xp,
  onNext,
  onFlip,
  onPick,
  onRestart,
}: {
  step: LessonStep;
  flipped: boolean;
  picked: string | null;
  xp: number;
  onNext: (correct?: boolean) => void;
  onFlip: () => void;
  onPick: (option: string) => void;
  onRestart: () => void;
}) {
  if (step.kind === "intro") {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-[var(--theme-text)]">
          {step.title}
        </p>
        <p className="mt-2 text-sm text-[var(--theme-text-muted)]">
          Короткие шаги, карточки, аудирование — как в Duolingo
        </p>
        <motion.button
          type="button"
          onClick={() => onNext(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25"
        >
          Начать
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    );
  }

  if (step.kind === "flashcard" && step.letter) {
    return (
      <div className="text-center">
        <p className="mb-3 text-sm text-[var(--theme-text-muted)]">
          {step.title}
        </p>
        <motion.button
          type="button"
          onClick={onFlip}
          whileTap={{ scale: 0.95 }}
          className="mx-auto flex h-44 w-full max-w-xs flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50 shadow-inner dark:from-emerald-950/40 dark:to-amber-950/30"
          style={{ perspective: 800 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={flipped ? "back" : "front"}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {flipped ? (
                <>
                  <p className="text-lg font-semibold text-[var(--theme-text)]">
                    {step.letter.name}
                  </p>
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    {step.letter.transliteration}
                  </p>
                </>
              ) : (
                <p dir="rtl" lang="ar" className="text-6xl text-[var(--theme-text)]">
                  {step.letter.char}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onNext(true)}
          whileTap={{ scale: 0.95 }}
          className="mt-4 rounded-3xl border border-emerald-300 bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Понятно!
        </motion.button>
      </div>
    );
  }

  if (step.kind === "translate" || step.kind === "listen") {
    return (
      <div>
        <p className="mb-3 text-sm font-medium text-[var(--theme-text)]">
          {step.title}
        </p>
        {step.letter && (
          <div className="mb-4 flex items-center justify-center gap-2">
            <span dir="rtl" lang="ar" className="text-4xl text-[var(--theme-text)]">
              {step.letter.char}
            </span>
            {step.kind === "listen" && (
              <motion.button
                type="button"
                onClick={() => speakArabicLetter(step.letter!.speech)}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border border-emerald-200 bg-emerald-50 p-2 text-emerald-700"
              >
                <Volume2 className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        )}
        <ul className="space-y-2">
          {step.options?.map((opt) => {
            const isPicked = picked === opt;
            const isCorrect = opt === step.correct;
            let cls = "border-[var(--theme-border)] bg-[var(--theme-surface)]";
            if (picked) {
              if (isCorrect) cls = "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40";
              else if (isPicked) cls = "border-red-300 bg-red-50 dark:bg-red-950/30";
            }
            return (
              <li key={opt}>
                <motion.button
                  type="button"
                  disabled={Boolean(picked)}
                  onClick={() => onPick(opt)}
                  whileTap={!picked ? { scale: 0.95 } : undefined}
                  className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-sm text-[var(--theme-text)] ${cls}`}
                >
                  {opt}
                  {picked && isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {picked && isPicked && !isCorrect && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-xl font-semibold text-emerald-800 dark:text-emerald-300">
        Машаллах! 🌙
      </p>
      <p className="mt-2 text-sm text-[var(--theme-text-muted)]">
        Вы заработали {xp} XP за этот урок
      </p>
      <motion.button
        type="button"
        onClick={onRestart}
        whileTap={{ scale: 0.95 }}
        className="mt-5 rounded-3xl border border-emerald-300 bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Пройти снова
      </motion.button>
    </div>
  );
}
