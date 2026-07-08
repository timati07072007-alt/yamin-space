"use client";

import { motion } from "framer-motion";
import { BookOpen, MoonStar, UserRound } from "lucide-react";
import type { ComponentType } from "react";

export type TabId = "profile" | "prayer" | "knowledge";

interface TabConfig {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: "prayer", label: "Намаз и Компас", icon: MoonStar },
  { id: "profile", label: "Профиль", icon: UserRound },
  { id: "knowledge", label: "Знания", icon: BookOpen },
];

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
      <div className="flex w-full max-w-sm items-center gap-1 rounded-[2rem] border border-amber-900/10 bg-white/85 p-1.5 shadow-[0_16px_44px_-16px_rgba(146,104,41,0.45)] backdrop-blur-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              whileTap={{ scale: 0.95 }}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-3xl px-3 py-2.5"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="absolute inset-0 rounded-3xl border border-emerald-200 bg-emerald-100/80"
                />
              )}
              <Icon
                className={`relative h-5 w-5 transition-colors duration-200 ${
                  isActive ? "text-emerald-700" : "text-stone-400"
                }`}
              />
              <span
                className={`relative text-[10px] font-medium tracking-wide transition-colors duration-200 ${
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
