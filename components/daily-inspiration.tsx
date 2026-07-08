"use client";

import { motion } from "framer-motion";
import { BookOpenText, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchDailyAyah,
  pickDailyHadith,
  type DailyAyah,
} from "@/lib/daily-content";
import { fetchHadiths, type Hadith } from "@/lib/knowledge";

const cozyCard =
  "w-full max-w-sm overflow-hidden rounded-[2rem] border border-amber-900/10 bg-white/75 shadow-[0_20px_50px_-24px_rgba(146,104,41,0.35)] backdrop-blur-xl";

function CardShell({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: "emerald" | "amber";
  children: React.ReactNode;
}) {
  const iconClass =
    accent === "emerald"
      ? "border-emerald-200 bg-emerald-100/80 text-emerald-700"
      : "border-amber-200 bg-amber-100/80 text-amber-700";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cozyCard}
    >
      <div className="flex items-center gap-3 border-b border-stone-200/70 px-5 py-3.5">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl border ${iconClass}`}
        >
          {icon}
        </div>
        <h2 className="text-sm font-semibold tracking-wide text-stone-700">
          {title}
        </h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.section>
  );
}

function DailyAyahCard() {
  const [ayah, setAyah] = useState<DailyAyah | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchDailyAyah()
      .then((loaded) => {
        if (!cancelled) {
          setAyah(loaded);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CardShell
      icon={<BookOpenText className="h-4.5 w-4.5" />}
      title="Аят дня"
      accent="emerald"
    >
      {failed && (
        <p className="py-2 text-center text-xs text-stone-400">
          Не удалось загрузить аят. Проверьте соединение.
        </p>
      )}

      {!ayah && !failed && (
        <div className="space-y-2 py-1" aria-hidden="true">
          <div className="ml-auto h-5 w-4/5 animate-pulse rounded-full bg-stone-200/80" />
          <div className="h-3.5 w-full animate-pulse rounded-full bg-stone-200/60" />
          <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-stone-200/60" />
        </div>
      )}

      {ayah && (
        <>
          <p
            dir="rtl"
            lang="ar"
            className="text-right text-xl leading-loose text-stone-800"
          >
            {ayah.arabic}
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
            {ayah.russian}
          </p>
          <p className="mt-3 text-xs font-medium text-emerald-700">
            Сура {ayah.surahNumber} «{ayah.surahNameEnglish}», аят{" "}
            {ayah.numberInSurah}
          </p>
        </>
      )}
    </CardShell>
  );
}

function DailyHadithCard() {
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchHadiths()
      .then((list) => {
        if (!cancelled) {
          const picked = pickDailyHadith(list);
          if (picked) {
            setHadith(picked);
          } else {
            setFailed(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CardShell
      icon={<ScrollText className="h-4.5 w-4.5" />}
      title="Хадис дня"
      accent="amber"
    >
      {failed && (
        <p className="py-2 text-center text-xs text-stone-400">
          Не удалось загрузить хадис. Проверьте соединение.
        </p>
      )}

      {!hadith && !failed && (
        <div className="space-y-2 py-1" aria-hidden="true">
          <div className="h-3.5 w-full animate-pulse rounded-full bg-stone-200/60" />
          <div className="h-3.5 w-full animate-pulse rounded-full bg-stone-200/60" />
          <div className="h-3.5 w-1/2 animate-pulse rounded-full bg-stone-200/60" />
        </div>
      )}

      {hadith && (
        <>
          <p className="text-sm leading-relaxed text-stone-700">
            «{hadith.text_ru}»
          </p>
          <p className="mt-3 text-xs text-stone-500">
            {hadith.author}
            <span className="mx-1.5 text-stone-300">·</span>
            {hadith.collection}
          </p>
        </>
      )}
    </CardShell>
  );
}

export function DailyInspiration() {
  return (
    <>
      <DailyAyahCard />
      <DailyHadithCard />
    </>
  );
}
