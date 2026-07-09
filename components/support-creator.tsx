"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { cozyCardClass } from "@/lib/animations";

const CREATOR_TELEGRAM = "@netxght_v";
const DONATION_NAME = "Жалилов Т. Р.";
const DONATION_PHONE = "+996 (501) 103-510";

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

      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-white shadow-sm">
        <div className="bg-gradient-to-b from-[#1e4fd6] to-[#163fb8] px-4 py-3 text-center text-white">
          <p className="text-sm font-semibold tracking-wide">{DONATION_NAME}</p>
          <p className="mt-0.5 text-xs font-medium text-white/90">
            {DONATION_PHONE}
          </p>
        </div>

        <div className="px-4 py-4">
          <div className="mx-auto max-w-[220px] overflow-hidden rounded-xl border border-stone-100 bg-white">
            <Image
              src="/donation-qr.png"
              alt="QR-код для перевода через ELQR"
              width={440}
              height={640}
              className="h-auto w-full"
              priority
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-600 text-[8px] font-bold text-white">
              QR
            </span>
            <div className="text-left">
              <p className="text-xs font-bold tracking-wide text-stone-800">
                ELQR
              </p>
              <p className="text-[10px] text-stone-500">
                Элкарт · оператор взаимодействия
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
