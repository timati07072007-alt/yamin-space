"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Gem, Skull, Zap } from "lucide-react";
import { useState } from "react";

import { LevelTestCard } from "@/components/level-test-card";
import { ScholarPathGame } from "@/components/scholar-path-game";
import type { AcademyDifficulty } from "@/lib/academy-quiz";
import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";

type View = "hub" | "test" | "scholar";

const DIFFICULTIES: Array<{
  id: AcademyDifficulty;
  label: string;
  desc: string;
  icon: typeof Zap;
  accent: string;
}> = [
  {
    id: "easy",
    label: "Легко",
    desc: "20 уникальных базовых вопросов",
    icon: Zap,
    accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    id: "medium",
    label: "Средне",
    desc: "20 вопросов средней сложности",
    icon: BrainCircuit,
    accent: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    id: "hardcore",
    label: "Хардкор",
    desc: "20 сложных вопросов · шанс на алмаз 💎",
    icon: Gem,
    accent: "border-violet-200 bg-violet-50 text-violet-800",
  },
];

export function AcademyHub() {
  const [view, setView] = useState<View>("hub");
  const [difficulty, setDifficulty] = useState<AcademyDifficulty>("easy");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-5"
    >
      <AnimatePresence mode="wait">
        {view === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex w-full flex-col items-center gap-5"
          >
            <motion.section
              variants={staggerItem}
              className={`${cozyCardClass} max-w-sm px-5 py-4`}
            >
              <h2 className="text-sm font-semibold text-stone-800">
                Выбор сложности
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Каждый уровень — свой набор вопросов, без повторов между
                режимами
              </p>
              <div className="mt-3 space-y-2">
                {DIFFICULTIES.map((item) => {
                  const Icon = item.icon;
                  const active = difficulty === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficulty(item.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition-shadow ${
                        active
                          ? `${item.accent} shadow-sm`
                          : "border-stone-200 bg-white/70"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>
                        <span className="block text-sm font-semibold">
                          {item.label}
                        </span>
                        <span className="block text-xs opacity-80">
                          {item.desc}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>

            <motion.button
              variants={staggerItem}
              type="button"
              onClick={() => setView("scholar")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex w-full max-w-sm items-center gap-3 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50 px-5 py-4 text-left shadow-[0_12px_40px_-20px_rgba(217,164,65,0.45)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-700">
                <Skull className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  Путь учёного
                </p>
                <p className="text-xs text-stone-500">
                  3 ❤️ · карта уровней · {DIFFICULTIES.find((d) => d.id === difficulty)?.label}
                </p>
              </div>
            </motion.button>

            <motion.div variants={staggerItem} className="w-full max-w-sm">
              <LevelTestCard difficulty={difficulty} />
            </motion.div>
          </motion.div>
        )}

        {view === "scholar" && (
          <motion.div
            key="scholar"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="w-full max-w-sm"
          >
            <ScholarPathGame
              difficulty={difficulty}
              onBack={() => setView("hub")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
