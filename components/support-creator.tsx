"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { cozyCardClass } from "@/lib/animations";

/** Замените public/donation-qr.png на свой QR-код для перевода */
const CREATOR_TELEGRAM = "@yamin_space";

export function SupportCreator() {
  return (
    <section className={`${cozyCardClass} max-w-sm px-5 py-5`}>
      <h2 className="text-sm font-semibold text-[var(--theme-text)]">
        Поддержать автора
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-[var(--theme-text-muted)]">
        Если приложение помогло вам — можно поблагодарить разработчика.
        Напишите в Telegram:
      </p>
      <motion.a
        href={`https://t.me/${CREATOR_TELEGRAM.replace("@", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.97 }}
        className="mt-2 inline-block text-sm font-medium text-emerald-700 dark:text-emerald-400"
      >
        {CREATOR_TELEGRAM}
      </motion.a>

      <div className="mt-4 flex flex-col items-center rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] p-4">
        <p className="mb-3 text-[10px] text-[var(--theme-text-muted)]">
          QR-код для перевода
        </p>
        <Image
          src="/donation-qr.png"
          alt="QR-код для поддержки автора"
          width={180}
          height={180}
          className="rounded-xl"
          priority={false}
        />
      </div>
    </section>
  );
}
