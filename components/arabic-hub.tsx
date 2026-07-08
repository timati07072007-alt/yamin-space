"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Brain, Grid3X3, Languages } from "lucide-react";
import { useState } from "react";

import { ArabicAlphabetPanel } from "@/components/arabic-alphabet-panel";
import { ArabicDictionaryPanel } from "@/components/arabic-dictionary-panel";
import { ArabicGrammarPanel } from "@/components/arabic-grammar-panel";
import { ArabicLearnPanel } from "@/components/arabic-learn-panel";
import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";
import { hapticSelection } from "@/lib/haptic";

type ArabicSection = "alphabet" | "words" | "learn" | "grammar";

const SECTIONS: Array<{
  id: ArabicSection;
  label: string;
  desc: string;
  icon: typeof Grid3X3;
  color: string;
}> = [
  {
    id: "alphabet",
    label: "Алфавит",
    desc: "28 букв с формами",
    icon: Grid3X3,
    color: "from-emerald-100 to-teal-50",
  },
  {
    id: "words",
    label: "Слова",
    desc: "Словарь с озвучкой",
    icon: Languages,
    color: "from-sky-100 to-blue-50",
  },
  {
    id: "learn",
    label: "Учить",
    desc: "Карточки и викторина",
    icon: Brain,
    color: "from-amber-100 to-orange-50",
  },
  {
    id: "grammar",
    label: "Правила",
    desc: "Грамматика",
    icon: BookOpen,
    color: "from-violet-100 to-purple-50",
  },
];

export function ArabicHub() {
  const [section, setSection] = useState<ArabicSection>("alphabet");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-4"
    >
      <motion.header
        variants={staggerItem}
        className={`${cozyCardClass} max-w-sm px-5 py-4 text-center`}
      >
        <p className="text-lg font-semibold text-[var(--theme-text)]">
          Арабский язык
        </p>
        <p className="mt-1 text-xs text-[var(--theme-text-muted)]">
          Алфавит → Слова → Учить → Правила
        </p>
      </motion.header>

      <motion.nav
        variants={staggerItem}
        className={`${cozyCardClass} flex max-w-sm gap-1.5 p-1.5`}
      >
        {SECTIONS.map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => {
                hapticSelection();
                setSection(item.id);
              }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2.5 ${
                active ? "text-emerald-800" : "text-[var(--theme-text-muted)]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="arabic-section-active"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} dark:opacity-40`}
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative text-[10px] font-semibold leading-tight">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </motion.nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="w-full max-w-sm"
        >
          {section === "alphabet" && <ArabicAlphabetPanel />}
          {section === "words" && <ArabicDictionaryPanel />}
          {section === "learn" && <ArabicLearnPanel />}
          {section === "grammar" && <ArabicGrammarPanel />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
