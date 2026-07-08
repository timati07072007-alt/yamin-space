"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { fetchBookPages, type BookPage } from "@/lib/books-reader";
import { hapticSelection } from "@/lib/haptic";
import type { Book } from "@/lib/knowledge";

const FONT_SIZES = [14, 16, 18, 20, 22] as const;

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

export function BookReader({ book, onClose }: BookReaderProps) {
  const [pages, setPages] = useState<BookPage[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<number>(16);
  const touchStart = useRef<number | null>(null);

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

  const goNext = useCallback(() => {
    hapticSelection();
    setPageIndex((v) => Math.min(pages.length - 1, v + 1));
  }, [pages.length]);

  const goPrev = useCallback(() => {
    hapticSelection();
    setPageIndex((v) => Math.max(0, v - 1));
  }, []);

  const progress =
    pages.length > 0 ? ((pageIndex + 1) / pages.length) * 100 : 0;
  const page = pages[pageIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="book-reader-root fixed inset-0 z-[60] flex flex-col bg-[var(--theme-bg,#faf6ee)]"
    >
      <header className="book-reader-header flex shrink-0 items-center gap-3 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/90 px-4 py-3 backdrop-blur-lg">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100/80 text-amber-700">
          <BookMarked className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-[var(--theme-text)]">
            {book.title}
          </h2>
          <p className="truncate text-[11px] text-[var(--theme-text-muted)]">
            {book.author}
            {pages.length > 0 && ` · ${pageIndex + 1} / ${pages.length}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            aria-label="Уменьшить шрифт"
            disabled={fontSize <= FONT_SIZES[0]}
            onClick={() =>
              setFontSize((s) => Math.max(FONT_SIZES[0], s - 2))
            }
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--theme-border)] text-[var(--theme-text-muted)] disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" />
          </motion.button>
          <span className="w-6 text-center text-[10px] font-medium text-[var(--theme-text-muted)]">
            {fontSize}
          </span>
          <motion.button
            type="button"
            aria-label="Увеличить шрифт"
            disabled={fontSize >= FONT_SIZES[FONT_SIZES.length - 1]}
            onClick={() =>
              setFontSize((s) =>
                Math.min(FONT_SIZES[FONT_SIZES.length - 1], s + 2),
              )
            }
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--theme-border)] text-[var(--theme-text-muted)] disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </motion.button>
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            aria-label="Закрыть книгу"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--theme-border)] text-[var(--theme-text-muted)]"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
      </header>

      {pages.length > 0 && (
        <div className="h-1 shrink-0 bg-[var(--theme-border)]">
          <motion.div
            className="h-full bg-emerald-500"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      )}

      <div
        className="book-reader-body flex flex-1 flex-col overflow-hidden px-4 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]"
        onTouchStart={(e) => {
          touchStart.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStart.current === null || pages.length <= 1) return;
          const end = e.changedTouches[0]?.clientX ?? touchStart.current;
          const delta = end - touchStart.current;
          if (Math.abs(delta) > 60) {
            if (delta < 0) goNext();
            else goPrev();
          }
          touchStart.current = null;
        }}
      >
        {loading && (
          <div className="flex flex-1 items-center justify-center gap-2 text-[var(--theme-text-muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Загружаем страницы...
          </div>
        )}

        {!loading && pages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-sm text-[var(--theme-text-muted)]">
              Страницы ещё не добавлены.
            </p>
            {book.content_text && (
              <p
                className="book-reader-fallback mt-4 max-w-md whitespace-pre-line leading-relaxed text-[var(--theme-text)]"
                style={{ fontSize }}
              >
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
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="book-reader-page mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-y-auto rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-sm"
            >
              {page.illustration_url && (
                // eslint-disable-next-line @next/next/no-img-element -- external illustration URLs
                <img
                  src={page.illustration_url}
                  alt=""
                  className="mb-4 max-h-44 w-full rounded-2xl object-cover"
                />
              )}
              <div
                className="book-reader-content flex-1 leading-[1.85] text-[var(--theme-text)]"
                style={{ fontSize }}
                dangerouslySetInnerHTML={{ __html: page.content_html }}
              />
            </motion.article>
          </AnimatePresence>
        )}

        {pages.length > 1 && (
          <nav className="mt-3 flex shrink-0 items-center justify-between gap-3">
            <motion.button
              type="button"
              disabled={pageIndex <= 0}
              onClick={goPrev}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </motion.button>
            <span className="text-[11px] text-[var(--theme-text-muted)]">
              {Math.round(progress)}%
            </span>
            <motion.button
              type="button"
              disabled={pageIndex >= pages.length - 1}
              onClick={goNext}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 rounded-2xl border border-emerald-300 bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Далее
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </nav>
        )}
      </div>
    </motion.div>
  );
}
