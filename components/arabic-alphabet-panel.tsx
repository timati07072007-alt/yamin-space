"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Volume2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cozyCardClass } from "@/lib/animations";
import {
  ARABIC_ALPHABET_FULL,
  type ArabicLetterFull,
} from "@/lib/arabic-alphabet";
import { speakArabicLetter, primeArabicVoices } from "@/lib/arabic-audio";
import { hapticSelection } from "@/lib/haptic";

export function ArabicAlphabetPanel() {
  const [selected, setSelected] = useState<ArabicLetterFull | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    primeArabicVoices();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

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
            whileHover={{ scale: 1.06, y: -2 }}
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
            className="letter-modal-overlay fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            onClick={close}
          >
            <motion.div
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="letter-modal-sheet w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
              style={{ perspective: 900 }}
            >
              <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
                <p className="truncate font-semibold text-[var(--theme-text)]">
                  {selected.name}
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Закрыть"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--theme-border)]"
                >
                  <X className="h-4 w-4 text-[var(--theme-text-muted)]" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setFlipped((v) => !v);
                  if (!flipped) speakArabicLetter(selected.speech);
                }}
                className="letter-flip-card mx-auto flex w-full max-w-full items-center justify-center rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/40"
                style={{ transformStyle: "preserve-3d" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={flipped ? "back" : "front"}
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.35, type: "spring", stiffness: 260 }}
                    className="w-full px-3 text-center"
                  >
                    {flipped ? (
                      <>
                        <p className="text-base font-semibold text-[var(--theme-text)] sm:text-lg">
                          {selected.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--theme-text-muted)] sm:text-sm">
                          Звук: {selected.transliteration}
                        </p>
                      </>
                    ) : (
                      <span
                        dir="rtl"
                        lang="ar"
                        className="letter-modal-glyph block text-[var(--theme-text)]"
                      >
                        {selected.char}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>

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
                    className="letter-form-cell rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-2 py-2 text-center"
                  >
                    <p className="text-[9px] text-[var(--theme-text-muted)]">
                      {label}
                    </p>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="letter-form-glyph text-[var(--theme-text)]"
                    >
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
