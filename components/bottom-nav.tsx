"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Home,
  Languages,
  UserRound,
} from "lucide-react";
import type { ComponentType } from "react";

export type TabId = "home" | "arabic" | "academy" | "library" | "profile";

interface TabConfig {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: "home", label: "Главная", icon: Home },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="flex w-full max-w-lg items-center gap-0.5 rounded-3xl border border-amber-900/10 bg-white/90 p-1 shadow-[0_16px_44px_-16px_rgba(146,104,41,0.4)] backdrop-blur-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-3xl px-1 py-2"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  className="absolute inset-0 rounded-3xl border border-emerald-200 bg-emerald-100/90"
                />
              )}
              <Icon
                className={`relative h-4.5 w-4.5 ${
                  isActive ? "text-emerald-700" : "text-stone-400"
                }`}
              />
              <span
                className={`relative text-[9px] font-medium leading-tight ${
                  isActive ? "text-emerald-800" : "text-stone-400"
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
