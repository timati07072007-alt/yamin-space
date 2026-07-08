"use client";

import { motion } from "framer-motion";

import { cozyCardClass } from "@/lib/animations";

const CREATOR_TELEGRAM = "@netxght_v";

export function SupportCreator() {
  return (
    <section className={`${cozyCardClass} max-w-sm px-5 py-5`}>
      <h2 className="text-sm font-semibold text-[var(--theme-text)]">
        Поддержать автора
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-[var(--theme-text-muted)]">
        Напишите разработчику в Telegram — буду рад обратной связи и идеям
        для улучшения Yamin Space.
      </p>
      <motion.a
        href={`https://t.me/${CREATOR_TELEGRAM.replace("@", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.97 }}
        className="mt-3 inline-block text-sm font-medium text-emerald-700 dark:text-emerald-400"
      >
        {CREATOR_TELEGRAM}
      </motion.a>

      <div className="mt-4 rounded-2xl border border-dashed border-[var(--theme-border)] bg-[var(--theme-bg)] px-4 py-6 text-center">
        <p className="text-[10px] text-[var(--theme-text-muted)]">
          QR-код для перевода будет добавлен позже
        </p>
      </div>
    </section>
  );
}
