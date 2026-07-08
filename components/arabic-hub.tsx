"use client";

import { motion } from "framer-motion";

import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";

import { ArabicSection } from "./arabic-section";

const MODULES = [
  { id: "letters", title: "Буквы", desc: "28 букв алфавита" },
  { id: "vowels", title: "Огласовки", desc: "Фatha, kasra, damma" },
  { id: "tajweed", title: "Таджвид", desc: "Правила чтения" },
  { id: "vocab", title: "Словарь", desc: "Базовые слова" },
] as const;

export function ArabicHub() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-5"
    >
      <motion.section variants={staggerItem} className={`${cozyCardClass} max-w-sm px-5 py-4`}>
        <h2 className="text-sm font-semibold text-stone-800">Модули обучения</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {MODULES.map((mod) => (
            <motion.div
              key={mod.id}
              whileHover={{ scale: 1.03 }}
              className="rounded-3xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5"
            >
              <p className="text-xs font-semibold text-emerald-800">{mod.title}</p>
              <p className="text-[10px] text-stone-500">{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className={`${cozyCardClass} max-w-sm px-4 py-4`}>
        <ArabicSection />
      </motion.section>
    </motion.div>
  );
}
