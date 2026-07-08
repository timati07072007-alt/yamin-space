"use client";

import { motion } from "framer-motion";
import { Copy, Heart, ExternalLink } from "lucide-react";
import { useState } from "react";

import { cozyCardClass } from "@/lib/animations";
import { hapticSuccess } from "@/lib/haptic";

const DONATE_CARD = "2200 7007 1234 5678";
const DONATE_LINK = "https://t.me/yamin_space_support";

export function SupportCreator() {
  const [copied, setCopied] = useState(false);

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(DONATE_CARD.replace(/\s/g, ""));
      hapticSuccess();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={`${cozyCardClass} max-w-sm px-5 py-5`}>
      <div className="mb-3 flex items-center gap-2">
        <Heart className="h-5 w-5 fill-rose-400 text-rose-500" />
        <h2 className="text-sm font-semibold text-[var(--theme-text)]">
          Поддержать создателя
        </h2>
      </div>

      <p className="text-xs leading-relaxed text-[var(--theme-text-muted)]">
        Yamin Space создаётся с любовью для мусульманской молодёжи. Ваша
        поддержка помогает добавлять контент, улучшать дизайн и развивать
        приложение.
      </p>

      <div className="mt-4 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-bg)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">
          Перевод на карту
        </p>
        <p className="mt-1 font-mono text-sm font-medium text-[var(--theme-text)]">
          {DONATE_CARD}
        </p>
        <motion.button
          type="button"
          onClick={() => void copyCard()}
          whileTap={{ scale: 0.95 }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Скопировано!" : "Скопировать номер"}
        </motion.button>
      </div>

      <motion.a
        href={DONATE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-rose-400 to-amber-400 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-300/30"
      >
        <ExternalLink className="h-4 w-4" />
        Поддержать через Telegram
      </motion.a>

      <p className="mt-3 text-center text-[10px] text-[var(--theme-text-muted)]">
        Джазакум Аллаhу хайран за вашу щедрость 🤲
      </p>
    </section>
  );
}
