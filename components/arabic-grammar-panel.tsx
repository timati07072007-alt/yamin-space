"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookMarked, ChevronDown, Volume2 } from "lucide-react";
import { useState } from "react";

import { cozyCardClass } from "@/lib/animations";
import { speakArabic } from "@/lib/arabic-alphabet";
import { GRAMMAR_RULES } from "@/lib/arabic-grammar";
import { hapticSelection } from "@/lib/haptic";

export function ArabicGrammarPanel() {
  const [openId, setOpenId] = useState<string | null>(GRAMMAR_RULES[0]?.id ?? null);

  return (
    <div className={`${cozyCardClass} px-4 py-4`}>
      <div className="mb-3 flex items-center gap-2">
        <BookMarked className="h-5 w-5 text-violet-600" />
        <div>
          <p className="text-sm font-semibold text-[var(--theme-text)]">
            Правила и грамматика
          </p>
          <p className="text-[10px] text-[var(--theme-text-muted)]">
            {GRAMMAR_RULES.length} базовых правил для начинающих
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {GRAMMAR_RULES.map((rule) => {
          const isOpen = openId === rule.id;
          return (
            <li key={rule.id}>
              <motion.button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setOpenId(isOpen ? null : rule.id);
                }}
                whileTap={{ scale: 0.98 }}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                  isOpen
                    ? "border-violet-300 bg-violet-50/80 dark:bg-violet-950/30"
                    : "border-[var(--theme-border)] bg-[var(--theme-surface)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--theme-text)]">
                    {rule.title}
                  </p>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <ChevronDown className="h-4 w-4 text-[var(--theme-text-muted)]" />
                  </motion.span>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-xs leading-relaxed text-[var(--theme-text-muted)]">
                        {rule.summary}
                      </p>
                      <div className="mt-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              dir="rtl"
                              lang="ar"
                              className="text-lg text-[var(--theme-text)]"
                            >
                              {rule.exampleAr}
                            </p>
                            <p className="mt-1 text-sm text-[var(--theme-text)]">
                              {rule.exampleRu}
                            </p>
                            <p className="text-[10px] italic text-[var(--theme-text-muted)]">
                              {rule.exampleTr}
                            </p>
                          </div>
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakArabic(rule.exampleAr.replace(/ · /g, " "));
                            }}
                            whileTap={{ scale: 0.9 }}
                            className="rounded-full border border-violet-200 p-1.5 text-violet-700"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-400">
                        💡 {rule.tip}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
