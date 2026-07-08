"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Gem, Skull, Zap } from "lucide-react";
import { useState } from "react";

import { LevelTestCard } from "@/components/level-test-card";
import { ScholarPathGame } from "@/components/scholar-path-game";
import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";

type Difficulty = "easy" | "medium" | "hardcore";
type View = "menu" | "scholar";

const DIFFICULTIES: Array<{
  id: Difficulty;
  label: string;
  desc: string;
  icon: typeof Zap;
  accent: string;
}> = [
  {
    id: "easy",
    label: "Легко",
    desc: "Разогрев и базовые знания",
    icon: Zap,
    accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    id: "medium",
    label: "Средне",
    desc: "Уверенный уровень",
    icon: BrainCircuit,
    accent: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    id: "hardcore",
    label: "Хардкор",
    desc: "Шанс получить алмаз 💎",
    icon: Gem,
    accent: "border-violet-200 bg-violet-50 text-violet-800",
  },
];

export function AcademyHub() {
  const [view, setView] = useState<View>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-5"
    >
      <AnimatePresence mode="wait">
        {view === "menu" ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex w-full flex-col items-center gap-5"
          >
            <motion.section variants={staggerItem} className={`${cozyCardClass} max-w-sm px-5 py-4`}>
              <h2 className="text-sm font-semibold text-stone-800">Выбор сложности</h2>
              <div className="mt-3 space-y-2">
                {DIFFICULTIES.map((item) => {
                  const Icon = item.icon;
                  const active = difficulty === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficulty(item.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left ${
                        active ? item.accent : "border-stone-200 bg-white/70"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="block text-xs opacity-80">{item.desc}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>

            <motion.div variants={staggerItem} className="w-full max-w-sm">
              <LevelTestCard />
            </motion.div>

            <motion.button
              variants={staggerItem}
              type="button"
              onClick={() => setView("scholar")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full max-w-sm items-center gap-3 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-5 py-4 text-left shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-700">
                <Skull className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">Путь учёного</p>
                <p className="text-xs text-stone-500">
                  Викторина с жизнями и картой уровней · {difficulty}
                </p>
              </div>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="scholar"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="w-full max-w-sm"
          >
            <ScholarPathGame
              difficulty={difficulty}
              onBack={() => setView("menu")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
