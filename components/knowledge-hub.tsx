"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookMarked,
  BookOpenText,
  BrainCircuit,
  Languages,
  Loader2,
  ScrollText,
  Search,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, type ComponentType } from "react";

function SectionLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      Загрузка раздела...
    </div>
  );
}

const QuranSection = dynamic(
  () => import("@/components/quran-section").then((mod) => mod.QuranSection),
  { ssr: false, loading: () => <SectionLoader /> },
);

const HadithSection = dynamic(
  () => import("@/components/hadith-section").then((mod) => mod.HadithSection),
  { ssr: false, loading: () => <SectionLoader /> },
);

const BooksSection = dynamic(
  () => import("@/components/books-section").then((mod) => mod.BooksSection),
  { ssr: false, loading: () => <SectionLoader /> },
);

const QuizWizard = dynamic(
  () => import("@/components/quiz-wizard").then((mod) => mod.QuizWizard),
  { ssr: false, loading: () => <SectionLoader /> },
);

type SectionId = "quran" | "hadiths" | "books" | "arabic" | "quiz";

interface SectionConfig {
  id: SectionId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  searchable: boolean;
  searchPlaceholder?: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: "quran",
    label: "Коран",
    icon: BookOpenText,
    searchable: true,
    searchPlaceholder: "Название или номер суры...",
  },
  {
    id: "hadiths",
    label: "Хадисы",
    icon: ScrollText,
    searchable: true,
    searchPlaceholder: "Текст, автор или сборник...",
  },
  {
    id: "books",
    label: "Книги",
    icon: BookMarked,
    searchable: true,
    searchPlaceholder: "Название или автор книги...",
  },
  { id: "arabic", label: "Арабский", icon: Languages, searchable: false },
  { id: "quiz", label: "Квиз", icon: BrainCircuit, searchable: false },
];

const glassCard =
  "w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl";

function ArabicPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
        <Languages className="h-7 w-7" />
      </div>
      <p className="text-sm font-medium text-zinc-200">Уроки арабского языка</p>
      <p className="max-w-[16rem] text-xs leading-relaxed text-zinc-500">
        Раздел в разработке. Скоро здесь появятся интерактивные уроки алфавита,
        чтения и основ грамматики.
      </p>
    </div>
  );
}

export function KnowledgeHub() {
  const [activeSection, setActiveSection] = useState<SectionId>("quran");
  const [query, setQuery] = useState("");

  const section = SECTIONS.find((item) => item.id === activeSection)!;

  function switchSection(id: SectionId) {
    setActiveSection(id);
    setQuery("");
  }

  return (
    <section className={glassCard}>
      <div className="border-b border-white/5 px-4 pb-0 pt-4">
        <div className="flex gap-1 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchSection(item.id)}
                className="relative flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium"
              >
                {isActive && (
                  <motion.span
                    layoutId="knowledge-active-pill"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="absolute inset-0 rounded-2xl border border-emerald-400/25 bg-emerald-500/15"
                  />
                )}
                <Icon
                  className={`relative h-3.5 w-3.5 ${
                    isActive ? "text-emerald-300" : "text-zinc-500"
                  }`}
                />
                <span
                  className={`relative ${
                    isActive ? "text-emerald-200" : "text-zinc-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4">
        {section.searchable && (
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={section.searchPlaceholder}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-400/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-emerald-400/15"
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {activeSection === "quran" && <QuranSection query={query} />}
            {activeSection === "hadiths" && <HadithSection query={query} />}
            {activeSection === "books" && <BooksSection query={query} />}
            {activeSection === "arabic" && <ArabicPlaceholder />}
            {activeSection === "quiz" && <QuizWizard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
