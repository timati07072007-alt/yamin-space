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
  sahih: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  hasan: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  daif: "border-white/10 bg-white/5 text-zinc-400",
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
      <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!hadiths) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
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
      <p className="py-8 text-center text-sm text-zinc-500">
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
          className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5"
        >
          <div className="flex items-start gap-2.5">
            <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/70" />
            <p className="text-sm leading-relaxed text-zinc-200">
              «{hadith.text_ru}»
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-2.5">
            <span className="text-xs text-zinc-400">{hadith.author}</span>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs text-zinc-500">{hadith.collection}</span>
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
