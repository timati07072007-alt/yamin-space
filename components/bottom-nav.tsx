"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CircleDot,
  GraduationCap,
  Home,
  Languages,
  UserRound,
} from "lucide-react";
import type { ComponentType } from "react";

export type TabId =
  | "home"
  | "tasbih"
  | "arabic"
  | "academy"
  | "library"
  | "profile";

interface TabConfig {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: "home", label: "Главная", icon: Home },
  { id: "tasbih", label: "Тасбих", icon: CircleDot },
  { id: "arabic", label: "Арабский", icon: Languages },
  { id: "academy", label: "Академия", icon: GraduationCap },
  { id: "library", label: "Библиотека", icon: BookOpen },
  { id: "profile", label: "Профиль", icon: UserRound },
];

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-1 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="flex w-full max-w-lg items-center gap-0.5 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/95 p-1 shadow-[0_16px_44px_-16px_var(--theme-card-shadow)] backdrop-blur-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-0.5 py-1.5"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  className="absolute inset-0 rounded-2xl border border-emerald-200 bg-emerald-100/90 dark:bg-emerald-950/50"
                />
              )}
              <Icon
                className={`relative h-4 w-4 ${
                  isActive ? "text-emerald-700" : "text-[var(--theme-text-muted)]"
                }`}
              />
              <span
                className={`relative text-[8px] font-medium leading-none ${
                  isActive ? "text-emerald-800" : "text-[var(--theme-text-muted)]"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
