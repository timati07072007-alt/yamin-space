"use client";

import { motion } from "framer-motion";
import { BookMarked, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AGE_CATEGORY_LABELS,
  fetchBooks,
  type Book,
  type BookAgeCategory,
} from "@/lib/knowledge";

type AgeFilter = BookAgeCategory | "all";

const FILTERS: Array<{ id: AgeFilter; label: string }> = [
  { id: "all", label: "Все" },
  { id: "children", label: "Детям" },
  { id: "teens", label: "Подросткам" },
  { id: "adults", label: "Взрослым" },
];

interface BooksSectionProps {
  query: string;
}

export function BooksSection({ query }: BooksSectionProps) {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");

  useEffect(() => {
    let cancelled = false;

    fetchBooks()
      .then((list) => {
        if (!cancelled) {
          setBooks(list);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Не удалось загрузить книги",
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

  if (!books) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загружаем книги...
      </div>
    );
  }

  const normalized = query.trim().toLowerCase();

  const filtered = books.filter((book) => {
    const matchesAge = ageFilter === "all" || book.category_age === ageFilter;
    const matchesQuery =
      !normalized ||
      book.title.toLowerCase().includes(normalized) ||
      book.author.toLowerCase().includes(normalized);

    return matchesAge && matchesQuery;
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => {
          const isActive = ageFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setAgeFilter(filter.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Ничего не найдено
        </p>
      ) : (
        <ul className="max-h-[24rem] space-y-2.5 overflow-y-auto pr-1">
          {filtered.map((book, index) => (
            <motion.li
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
              className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug text-zinc-100">
                      {book.title}
                    </h3>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                      {AGE_CATEGORY_LABELS[book.category_age]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{book.author}</p>
                  {book.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                      {book.description}
                    </p>
                  )}
                  {book.content_url && (
                    <a
                      href={book.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-300 transition-colors hover:text-emerald-200"
                    >
                      Читать
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
