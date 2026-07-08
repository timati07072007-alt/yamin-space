"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Volume2, X } from "lucide-react";
import { useState } from "react";

import { cozyCardClass } from "@/lib/animations";
import {
  ARABIC_ALPHABET_FULL,
  speakArabicLetter,
  type ArabicLetterFull,
} from "@/lib/arabic-alphabet";
import { hapticSelection } from "@/lib/haptic";

export function ArabicAlphabetPanel() {
  const [selected, setSelected] = useState<ArabicLetterFull | null>(null);
  const [flipped, setFlipped] = useState(false);

  function openLetter(letter: ArabicLetterFull) {
    hapticSelection();
    setSelected(letter);
    setFlipped(false);
    speakArabicLetter(letter.speech);
  }

  function close() {
    setSelected(null);
    setFlipped(false);
  }

  return (
    <div className={`${cozyCardClass} px-4 py-4`}>
      <p className="mb-1 text-sm font-semibold text-[var(--theme-text)]">
        Алфавит — 28 букв
      </p>
      <p className="mb-4 text-xs text-[var(--theme-text-muted)]">
        Нажми на букву, чтобы услышать звук и увидеть все формы написания
      </p>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {ARABIC_ALPHABET_FULL.map((letter, i) => (
          <motion.button
            key={letter.id}
            type="button"
            onClick={() => openLetter(letter)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 22,
              delay: i * 0.02,
            }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.92 }}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-[var(--theme-border)] bg-gradient-to-br from-emerald-50/80 to-amber-50/60 shadow-sm dark:from-emerald-950/30 dark:to-amber-950/20"
          >
            <span dir="rtl" lang="ar" className="text-2xl text-[var(--theme-text)]">
              {letter.char}
            </span>
            <span className="mt-0.5 text-[8px] font-medium text-[var(--theme-text-muted)]">
              {letter.name}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="w-full max-w-sm rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ perspective: 1000 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-[var(--theme-text)]">
                  {selected.name}
                </p>
                <button type="button" onClick={close}>
                  <X className="h-4 w-4 text-[var(--theme-text-muted)]" />
                </button>
              </div>

              <motion.button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setFlipped((v) => !v);
                  if (!flipped) speakArabicLetter(selected.speech);
                }}
                whileTap={{ scale: 0.96 }}
                className="mx-auto flex h-40 w-full items-center justify-center rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/40"
                style={{ transformStyle: "preserve-3d" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={flipped ? "back" : "front"}
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 260 }}
                    className="text-center"
                  >
                    {flipped ? (
                      <>
                        <p className="text-lg font-semibold text-[var(--theme-text)]">
                          {selected.name}
                        </p>
                        <p className="text-sm text-[var(--theme-text-muted)]">
                          Звук: {selected.transliteration}
                        </p>
                      </>
                    ) : (
                      <span
                        dir="rtl"
                        lang="ar"
                        className="text-7xl text-[var(--theme-text)]"
                      >
                        {selected.char}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => speakArabicLetter(selected.speech)}
                whileTap={{ scale: 0.95 }}
                className="mx-auto mt-3 flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Прослушать
              </motion.button>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(
                  [
                    ["Изолированная", selected.forms.isolated],
                    ["Начальная", selected.forms.initial],
                    ["Срединная", selected.forms.medial],
                    ["Конечная", selected.forms.final],
                  ] as const
                ).map(([label, form]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2 text-center"
                  >
                    <p className="text-[9px] text-[var(--theme-text-muted)]">
                      {label}
                    </p>
                    <p dir="rtl" lang="ar" className="text-2xl text-[var(--theme-text)]">
                      {form}
                    </p>
                  </div>
                ))}
              </div>

              {!selected.connectsLeft && (
                <p className="mt-3 text-center text-[10px] text-[var(--theme-text-muted)]">
                  Эта буква не соединяется слева в слове
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
