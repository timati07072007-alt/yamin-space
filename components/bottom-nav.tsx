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
  { id: "profile", label: "Профиль", icon: UserRound },
  { id: "prayer", label: "Намаз", icon: MoonStar },
  { id: "knowledge", label: "Знания", icon: BookOpen },
];

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
      <div className="flex w-full max-w-sm items-center gap-1 rounded-3xl border border-white/10 bg-zinc-900/80 p-1.5 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.9)] backdrop-blur-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              whileTap={{ scale: 0.95 }}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2.5"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="absolute inset-0 rounded-2xl border border-emerald-400/25 bg-emerald-500/15"
                />
              )}
              <Icon
                className={`relative h-5 w-5 transition-colors duration-200 ${
                  isActive ? "text-emerald-300" : "text-zinc-500"
                }`}
              />
              <span
                className={`relative text-[10px] font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? "text-emerald-200" : "text-zinc-500"
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
