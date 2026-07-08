"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";
import {
  ARABIC_MODULE_LABELS,
  type ArabicModuleId,
} from "@/lib/arabic-modules";
import { hapticSelection } from "@/lib/haptic";

import { ArabicLessons } from "./arabic-lessons";

const MODULE_IDS = Object.keys(ARABIC_MODULE_LABELS) as ArabicModuleId[];

export function ArabicHub() {
  const [activeModule, setActiveModule] = useState<ArabicModuleId>("letters");

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
        <h2 className="text-sm font-semibold text-[var(--theme-text)]">
          Модули
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {MODULE_IDS.map((modId) => {
            const mod = ARABIC_MODULE_LABELS[modId];
            const isActive = activeModule === modId;
            return (
              <motion.button
                key={modId}
                type="button"
                onClick={() => {
                  hapticSelection();
                  setActiveModule(modId);
                }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`rounded-3xl border px-3 py-3 text-left shadow-sm transition-colors ${
                  isActive
                    ? "border-emerald-400 bg-gradient-to-br from-emerald-100 to-teal-50 ring-2 ring-emerald-300/60 dark:from-emerald-950/60 dark:to-teal-950/40"
                    : `border-white/80 bg-gradient-to-br ${mod.color} dark:border-stone-700`
                }`}
              >
                <span className="text-xl">{mod.emoji}</span>
                <p className="mt-1 text-xs font-semibold text-[var(--theme-text)]">
                  {mod.title}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <motion.div
        key={activeModule}
        variants={staggerItem}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <ArabicLessons module={activeModule} />
      </motion.div>
    </motion.div>
  );
}
