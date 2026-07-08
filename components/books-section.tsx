"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { fetchBookPages, type BookPage } from "@/lib/books-reader";
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

function BookReaderModal({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) {
  const [pages, setPages] = useState<BookPage[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchBookPages(book.id)
      .then((loaded) => {
        if (!cancelled) setPages(loaded);
      })
      .catch(() => {
        if (!cancelled) setPages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [book.id]);

  const page = pages[pageIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-[#faf6ee]"
    >
      <div className="flex items-center gap-3 border-b border-stone-200/80 bg-white/80 px-5 py-4 backdrop-blur-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl border border-amber-200 bg-amber-100/80 text-amber-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-stone-800">
            {book.title}
          </h2>
          <p className="truncate text-xs text-stone-400">
            {book.author}
            {pages.length > 0 && ` · стр. ${pageIndex + 1}/${pages.length}`}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
          aria-label="Закрыть книгу"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500"
        >
          <X className="h-4.5 w-4.5" />
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col px-5 py-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {loading && (
          <div className="flex flex-1 items-center justify-center gap-2 text-stone-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Загружаем страницы...
          </div>
        )}

        {!loading && pages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-sm text-stone-500">Страницы ещё не добавлены.</p>
            {book.content_text && (
              <p className="mt-4 max-w-md whitespace-pre-line text-sm leading-relaxed text-stone-700">
                {book.content_text}
              </p>
            )}
            {book.content_url && (
              <a
                href={book.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"
              >
                Внешний источник
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}

        {!loading && page && (
          <AnimatePresence mode="wait">
            <motion.article
              key={page.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="mx-auto flex min-h-[50vh] w-full max-w-md flex-1 flex-col rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-sm"
            >
              {page.illustration_url && (
                // eslint-disable-next-line @next/next/no-img-element -- external illustration URLs
                <img
                  src={page.illustration_url}
                  alt=""
                  className="mb-4 max-h-40 w-full rounded-3xl object-cover"
                />
              )}
              <div
                className="flex-1 text-[15px] leading-[1.9] text-stone-700"
                dangerouslySetInnerHTML={{ __html: page.content_html }}
              />
            </motion.article>
          </AnimatePresence>
        )}

        {pages.length > 1 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <motion.button
              type="button"
              disabled={pageIndex <= 0}
              onClick={() => setPageIndex((v) => Math.max(0, v - 1))}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 rounded-3xl border border-stone-200 bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </motion.button>
            <motion.button
              type="button"
              disabled={pageIndex >= pages.length - 1}
              onClick={() =>
                setPageIndex((v) => Math.min(pages.length - 1, v + 1))
              }
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 rounded-3xl border border-emerald-300 bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Далее
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function BooksSection({ query }: BooksSectionProps) {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [openBook, setOpenBook] = useState<Book | null>(null);

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
      <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!books) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-stone-400">
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
                  ? "border-emerald-300 bg-emerald-100/80 text-emerald-800"
                  : "border-stone-200 bg-white/70 text-stone-500 hover:bg-stone-100"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-400">
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
              className="rounded-3xl border border-stone-200/80 bg-white/70 px-4 py-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100/80 text-amber-700">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug text-stone-800">
                      {book.title}
                    </h3>
                    <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                      {AGE_CATEGORY_LABELS[book.category_age]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-400">{book.author}</p>
                  {book.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                      {book.description}
                    </p>
                  )}
                  <motion.button
                      type="button"
                      onClick={() => setOpenBook(book)}
                      whileTap={{ scale: 0.96 }}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Читать
                    </motion.button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {openBook && (
          <BookReaderModal book={openBook} onClose={() => setOpenBook(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
