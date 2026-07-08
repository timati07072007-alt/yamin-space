"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import {
  ADHKAR_CATEGORY_LABELS,
  ADHKAR_ITEMS,
  TASBIH_PRESETS,
  type AdhkarCategory,
  type TasbihPresetId,
} from "@/lib/adhkar";
import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";
import { hapticImpact, hapticSelection, hapticSuccess } from "@/lib/haptic";

export function AdhkarHub() {
  const [category, setCategory] = useState<AdhkarCategory>("morning");
  const [presetId, setPresetId] = useState<TasbihPresetId>("subhan");
  const [count, setCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const preset = TASBIH_PRESETS.find((p) => p.id === presetId)!;
  const progress = Math.min(count / preset.target, 1);

  const filtered = useMemo(
    () => ADHKAR_ITEMS.filter((item) => item.category === category),
    [category],
  );

  function tick() {
    hapticImpact("light");
    setCount((c) => {
      const next = c + 1;
      if (next >= preset.target) hapticSuccess();
      return next;
    });
  }

  function reset() {
    hapticSelection();
    setCount(0);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-5"
    >
      <motion.section
        variants={staggerItem}
        className={`${cozyCardClass} max-w-sm px-5 py-5`}
      >
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h2 className="text-sm font-semibold text-stone-800">
            Счётчик зикров
          </h2>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {TASBIH_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                hapticSelection();
                setPresetId(p.id);
                setCount(0);
              }}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                presetId === p.id
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-stone-200 text-stone-500"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="none"
              stroke="rgba(16,185,129,0.15)"
              strokeWidth="8"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="none"
              stroke="url(#tasbihGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 72}`}
              animate={{
                strokeDashoffset: 2 * Math.PI * 72 * (1 - progress),
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            <defs>
              <linearGradient id="tasbihGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>

          <motion.button
            type="button"
            onClick={tick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-amber-50 shadow-[0_12px_40px_-16px_rgba(16,185,129,0.45)]"
          >
            <span className="text-3xl font-bold tabular-nums text-emerald-800">
              {count}
            </span>
            <span className="text-[10px] text-stone-400">/ {preset.target}</span>
          </motion.button>
        </div>

        <p dir="rtl" lang="ar" className="mt-3 text-center text-lg text-stone-700">
          {preset.arabic}
        </p>

        <div className="mt-3 flex gap-2">
          <motion.button
            type="button"
            onClick={reset}
            whileTap={{ scale: 0.96 }}
            className="flex flex-1 items-center justify-center gap-1 rounded-3xl border border-stone-200 bg-white py-2 text-xs font-medium text-stone-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Сброс
          </motion.button>
        </div>
      </motion.section>

      <motion.section
        variants={staggerItem}
        className={`${cozyCardClass} max-w-sm px-4 py-4`}
      >
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-600" />
          <h2 className="text-sm font-semibold text-stone-800">Дуа и азкары</h2>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {(Object.keys(ADHKAR_CATEGORY_LABELS) as AdhkarCategory[]).map(
            (key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                  category === key
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-stone-200 text-stone-500"
                }`}
              >
                {ADHKAR_CATEGORY_LABELS[key]}
              </button>
            ),
          )}
        </div>

        <ul className="space-y-2">
          {filtered.map((item) => (
            <li key={item.id}>
              <motion.button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-3xl border border-stone-200/80 bg-white/80 px-4 py-3 text-left"
              >
                <p className="text-sm font-medium text-stone-800">
                  {item.title}
                  {item.repeat && item.repeat > 1 && (
                    <span className="ml-1 text-xs text-emerald-600">
                      ×{item.repeat}
                    </span>
                  )}
                </p>
                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p
                        dir="rtl"
                        lang="ar"
                        className="mt-2 text-lg leading-loose text-stone-800"
                      >
                        {item.arabic}
                      </p>
                      <p className="mt-1 text-xs italic text-stone-500">
                        {item.transliteration}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        {item.translation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </li>
          ))}
        </ul>
      </motion.section>
    </motion.div>
  );
}
