"use client";

import { motion } from "framer-motion";

import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";

import { ArabicLessons } from "./arabic-lessons";

const MODULES = [
  { id: "letters", title: "Буквы", emoji: "📖", color: "from-emerald-50 to-teal-50" },
  { id: "vowels", title: "Огласовки", emoji: "✨", color: "from-amber-50 to-orange-50" },
  { id: "tajweed", title: "Таджвид", emoji: "🕌", color: "from-violet-50 to-purple-50" },
  { id: "vocab", title: "Словарь", emoji: "💬", color: "from-sky-50 to-blue-50" },
] as const;

export function ArabicHub() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-5"
    >
      <motion.section
        variants={staggerItem}
        className={`${cozyCardClass} max-w-sm px-5 py-4`}
      >
        <h2 className="text-sm font-semibold text-stone-800">Модули</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {MODULES.map((mod) => (
            <motion.div
              key={mod.id}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-3xl border border-white/80 bg-gradient-to-br ${mod.color} px-3 py-3 shadow-sm`}
            >
              <span className="text-xl">{mod.emoji}</span>
              <p className="mt-1 text-xs font-semibold text-stone-800">
                {mod.title}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <ArabicLessons />
      </motion.div>
    </motion.div>
  );
}
