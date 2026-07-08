"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";

function SectionLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-stone-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      Загрузка...
    </div>
  );
}

const QuranSection = dynamic(
  () => import("@/components/quran-section").then((m) => m.QuranSection),
  { ssr: false, loading: () => <SectionLoader /> },
);
const BooksSection = dynamic(
  () => import("@/components/books-section").then((m) => m.BooksSection),
  { ssr: false, loading: () => <SectionLoader /> },
);
const HadithSection = dynamic(
  () => import("@/components/hadith-section").then((m) => m.HadithSection),
  { ssr: false, loading: () => <SectionLoader /> },
);

type Section = "quran" | "books" | "hadiths";

const SECTIONS: Array<{ id: Section; label: string }> = [
  { id: "quran", label: "Коран" },
  { id: "books", label: "Книги" },
  { id: "hadiths", label: "Хадисы" },
];

export function LibraryHub() {
  const [section, setSection] = useState<Section>("quran");
  const [query, setQuery] = useState("");

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={`${cozyCardClass} max-w-sm`}
    >
      <motion.div variants={staggerItem} className="border-b border-stone-200/70 px-4 pt-4 pb-3">
        <div className="flex gap-1">
          {SECTIONS.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => {
                setSection(item.id);
                setQuery("");
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`relative flex-1 rounded-2xl px-2 py-2 text-xs font-medium ${
                section === item.id
                  ? "bg-emerald-100/90 text-emerald-800"
                  : "text-stone-500"
              }`}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="px-4 py-4">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              section === "quran"
                ? "Фатиха, Корова, номер..."
                : section === "books"
                  ? "Название или автор..."
                  : "Текст или автор..."
            }
            className="w-full rounded-3xl border border-stone-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60"
          />
        </div>

        {section === "quran" && <QuranSection query={query} />}
        {section === "books" && <BooksSection query={query} />}
        {section === "hadiths" && <HadithSection query={query} />}
      </motion.div>
    </motion.section>
  );
}
