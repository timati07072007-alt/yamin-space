"use client";

import { motion } from "framer-motion";
import { Loader2, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AUTHENTICITY_LABELS,
  fetchHadiths,
  type Hadith,
} from "@/lib/knowledge";

const AUTHENTICITY_STYLES: Record<Hadith["authenticity"], string> = {
  sahih: "border-emerald-300 bg-emerald-100/80 text-emerald-800",
  hasan: "border-amber-300 bg-amber-100/80 text-amber-700",
  daif: "border-stone-200 bg-stone-100 text-stone-500",
};

interface HadithSectionProps {
  query: string;
}

export function HadithSection({ query }: HadithSectionProps) {
  const [hadiths, setHadiths] = useState<Hadith[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchHadiths()
      .then((list) => {
        if (!cancelled) {
          setHadiths(list);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Не удалось загрузить хадисы",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!hadiths) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-stone-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загружаем хадисы...
      </div>
    );
  }

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? hadiths.filter(
        (hadith) =>
          hadith.text_ru.toLowerCase().includes(normalized) ||
          hadith.author.toLowerCase().includes(normalized) ||
          hadith.collection.toLowerCase().includes(normalized),
      )
    : hadiths;

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone-400">
        Ничего не найдено
      </p>
    );
  }

  return (
    <ul className="max-h-[26rem] space-y-2.5 overflow-y-auto pr-1">
      {filtered.map((hadith, index) => (
        <motion.li
          key={hadith.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
          className="rounded-3xl border border-stone-200/80 bg-white/70 px-4 py-3.5"
        >
          <div className="flex items-start gap-2.5">
            <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600/80" />
            <p className="text-sm leading-relaxed text-stone-700">
              «{hadith.text_ru}»
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-200/70 pt-2.5">
            <span className="text-xs text-stone-500">{hadith.author}</span>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-xs text-stone-400">{hadith.collection}</span>
            <span
              className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${AUTHENTICITY_STYLES[hadith.authenticity]}`}
            >
              {AUTHENTICITY_LABELS[hadith.authenticity]}
            </span>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
