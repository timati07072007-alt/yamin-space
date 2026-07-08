"use client";

import { motion } from "framer-motion";
import { Loader2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchLeaderboard,
  LEAGUE_LABELS,
  type LeaderboardEntry,
  type LeagueTier,
} from "@/lib/gamification";
import { cozyCardClass } from "@/lib/animations";

const TIERS: LeagueTier[] = ["bronze", "silver", "gold", "emerald"];

const TIER_STYLE: Record<LeagueTier, string> = {
  bronze: "border-amber-300/60 bg-amber-50",
  silver: "border-slate-300 bg-slate-50",
  gold: "border-yellow-300 bg-yellow-50",
  emerald: "border-emerald-300 bg-emerald-50",
};

export function LeagueLeaderboard() {
  const [tier, setTier] = useState<LeagueTier>("bronze");
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchLeaderboard(tier)
      .then((list) => {
        if (!cancelled) setEntries(list);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });

    return () => {
      cancelled = true;
    };
  }, [tier]);

  return (
    <section className={`${cozyCardClass} max-w-sm px-4 py-4`}>
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-600" />
        <h3 className="text-sm font-semibold text-stone-800">Таблица лиг</h3>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {TIERS.map((item) => (
          <motion.button
            key={item}
            type="button"
            onClick={() => setTier(item)}
            whileTap={{ scale: 0.96 }}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
              tier === item
                ? TIER_STYLE[item]
                : "border-stone-200 text-stone-500"
            }`}
          >
            {LEAGUE_LABELS[item]}
          </motion.button>
        ))}
      </div>

      {!entries && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
        </div>
      )}

      {entries && entries.length === 0 && (
        <p className="py-4 text-center text-xs text-stone-400">
          Пока нет участников в этой лиге
        </p>
      )}

      <ul className="space-y-1.5">
        {entries?.map((entry) => (
          <motion.li
            key={entry.user_id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-3xl border border-stone-200/80 bg-white/70 px-3 py-2"
          >
            <span className="w-5 text-xs font-bold text-stone-400 tabular-nums">
              {entry.rank}
            </span>
            <span className="text-lg">{entry.avatar_emoji}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-stone-700">
              {entry.display_name}
            </span>
            <span className="text-xs font-semibold text-emerald-700 tabular-nums">
              {entry.weekly_xp} XP
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
