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

import {
  ARABIC_ALPHABET,
  speakArabicLetter,
  type ArabicLetter,
} from "@/lib/arabic-alphabet";
import { cozyCardClass } from "@/lib/animations";
import { hapticSelection, hapticSuccess, hapticError } from "@/lib/haptic";

type StepKind = "intro" | "flashcard" | "translate" | "listen" | "complete";

interface LessonStep {
  id: string;
  kind: StepKind;
  title: string;
  letter?: ArabicLetter;
  options?: string[];
  correct?: string;
}

const VOCAB = [
  { ar: "كِتَاب", ru: "Книга", tr: "kitab" },
  { ar: "مَسْجِد", ru: "Мечеть", tr: "masjid" },
  { ar: "مَاء", ru: "Вода", tr: "ma'" },
  { ar: "نُور", ru: "Свет", tr: "nur" },
  { ar: "سَلَام", ru: "Мир", tr: "salam" },
];

function buildSteps(): LessonStep[] {
  const letters = ARABIC_ALPHABET.slice(0, 8);
  const steps: LessonStep[] = [
    {
      id: "intro",
      kind: "intro",
      title: "Добро пожаловать! Сегодня — первые буквы.",
    },
  ];

  letters.forEach((letter, i) => {
    steps.push({
      id: `fc-${i}`,
      kind: "flashcard",
      title: `Буква ${letter.name}`,
      letter,
    });
    steps.push({
      id: `tr-${i}`,
      kind: "translate",
      title: "Выберите перевод",
      letter,
      options: shuffle([
        letter.name,
        ARABIC_ALPHABET[(i + 3) % ARABIC_ALPHABET.length].name,
        ARABIC_ALPHABET[(i + 5) % ARABIC_ALPHABET.length].name,
        ARABIC_ALPHABET[(i + 7) % ARABIC_ALPHABET.length].name,
      ]),
      correct: letter.name,
    });
  });

  VOCAB.slice(0, 3).forEach((word, i) => {
    steps.push({
      id: `listen-${i}`,
      kind: "listen",
      title: "Как переводится это слово?",
      options: shuffle([
        word.ru,
        VOCAB[(i + 1) % VOCAB.length].ru,
        VOCAB[(i + 2) % VOCAB.length].ru,
        "Дом",
      ]),
      correct: word.ru,
      letter: { char: word.ar, name: word.ru, transliteration: word.tr, speech: word.ar },
    });
  });

  steps.push({ id: "done", kind: "complete", title: "Урок завершён!" });
  return steps;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ArabicLessons() {
  const steps = useMemo(() => buildSteps(), []);
  const [stepIndex, setStepIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [xp, setXp] = useState(0);

  const step = steps[stepIndex];
  const progress = stepIndex / (steps.length - 1);

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
      <div className="border-b border-stone-200/60 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/80 px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-800">Урок 1</span>
          <span className="flex items-center gap-1 text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {xp} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-200/70">
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
            key={step.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {step.kind === "intro" && (
              <div className="text-center">
                <p className="text-lg font-semibold text-stone-800">
                  {step.title}
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  Короткие шаги, карточки, аудирование — как в Duolingo
                </p>
                <motion.button
                  type="button"
                  onClick={() => next(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white"
                >
                  Начать
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            )}

            {step.kind === "flashcard" && step.letter && (
              <div className="text-center">
                <p className="mb-3 text-sm text-stone-500">{step.title}</p>
                <motion.button
                  type="button"
                  onClick={() => {
                    hapticSelection();
                    setFlipped((v) => !v);
                    if (!flipped) speakArabicLetter(step.letter!.speech);
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="mx-auto flex h-44 w-full max-w-xs flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50 shadow-inner"
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
                          <p className="text-lg font-semibold text-stone-800">
                            {step.letter.name}
                          </p>
                          <p className="text-sm text-stone-500">
                            {step.letter.transliteration}
                          </p>
                        </>
                      ) : (
                        <p
                          dir="rtl"
                          lang="ar"
                          className="text-6xl text-stone-800"
                        >
                          {step.letter.char}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => next(true)}
                  whileTap={{ scale: 0.96 }}
                  className="mt-4 rounded-3xl border border-emerald-300 bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Понятно!
                </motion.button>
              </div>
            )}

            {(step.kind === "translate" || step.kind === "listen") && (
              <div>
                <p className="mb-3 text-sm font-medium text-stone-700">
                  {step.title}
                </p>
                {step.letter && (
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <span
                      dir="rtl"
                      lang="ar"
                      className="text-4xl text-stone-800"
                    >
                      {step.letter.char}
                    </span>
                    {step.kind === "listen" && (
                      <button
                        type="button"
                        onClick={() =>
                          speakArabicLetter(step.letter!.speech)
                        }
                        className="rounded-full border border-emerald-200 bg-emerald-50 p-2 text-emerald-700"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                <ul className="space-y-2">
                  {step.options?.map((opt) => {
                    const isPicked = picked === opt;
                    const isCorrect = opt === step.correct;
                    let cls = "border-stone-200 bg-white/90";
                    if (picked) {
                      if (isCorrect) cls = "border-emerald-300 bg-emerald-50";
                      else if (isPicked) cls = "border-red-300 bg-red-50";
                    }
                    return (
                      <li key={opt}>
                        <motion.button
                          type="button"
                          disabled={Boolean(picked)}
                          onClick={() => pick(opt)}
                          whileTap={!picked ? { scale: 0.97 } : undefined}
                          className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-sm ${cls}`}
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
            )}

            {step.kind === "complete" && (
              <div className="text-center">
                <p className="text-xl font-semibold text-emerald-800">
                  Машаллах! 🌙
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Вы заработали {xp} XP за этот урок
                </p>
                <motion.button
                  type="button"
                  onClick={() => {
                    setStepIndex(0);
                    setXp(0);
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-5 rounded-3xl border border-emerald-300 bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Пройти снова
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
