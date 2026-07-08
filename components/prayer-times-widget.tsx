"use client";

import { motion } from "framer-motion";
import { MapPin, MoonStar, Sunrise, Sunset } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import {
  formatCountdown,
  getPrayerSchedule,
  type PrayerSchedule,
} from "@/lib/prayer-times";

const PRAYER_SKELETON_ROWS = 7;

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

const cozyCard =
  "w-full max-w-sm overflow-hidden rounded-[2rem] border border-amber-900/10 bg-white/75 shadow-[0_20px_50px_-24px_rgba(146,104,41,0.35)] backdrop-blur-xl";

function PrayerTimesSkeleton() {
  return (
    <section aria-hidden="true" className={cozyCard}>
      <div className="border-b border-stone-200/70 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded-full bg-stone-200/80" />
            <div className="h-3 w-36 animate-pulse rounded-full bg-stone-200/60" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-stone-200/80" />
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-3xl bg-stone-100/80 px-4 py-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-stone-200/80" />
          <div className="mt-3 h-10 w-40 animate-pulse rounded-xl bg-stone-200/80" />
          <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-stone-200/80" />
        </div>

        <ul className="mt-4 space-y-1.5">
          {Array.from({ length: PRAYER_SKELETON_ROWS }, (_, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-3xl bg-stone-100/80 px-4 py-2.5"
            >
              <div className="h-4 w-16 animate-pulse rounded-full bg-stone-200/80" />
              <div className="h-4 w-12 animate-pulse rounded-full bg-stone-200/80" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface ScheduleRow {
  key: string;
  label: string;
  timeLabel: string;
  kind: "prayer" | "sun";
  isActive: boolean;
  isNext: boolean;
}

function buildRows(schedule: PrayerSchedule): ScheduleRow[] {
  const rows: ScheduleRow[] = [];

  for (const prayer of schedule.prayers) {
    rows.push({
      key: prayer.name,
      label: prayer.label,
      timeLabel: prayer.timeLabel,
      kind: "prayer",
      isActive: schedule.currentPrayer === prayer.name,
      isNext: schedule.nextPrayer === prayer.name,
    });

    if (prayer.name === "fajr") {
      rows.push({
        key: "sunrise",
        label: schedule.sunrise.label,
        timeLabel: schedule.sunrise.timeLabel,
        kind: "sun",
        isActive: false,
        isNext: false,
      });
    }

    if (prayer.name === "asr") {
      rows.push({
        key: "sunset",
        label: schedule.sunset.label,
        timeLabel: schedule.sunset.timeLabel,
        kind: "sun",
        isActive: false,
        isNext: false,
      });
    }
  }

  return rows;
}

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.15 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function PrayerTimesWidget() {
  const isClient = useIsClient();
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const updateSchedule = () => {
      setSchedule(getPrayerSchedule(new Date()));
    };

    updateSchedule();

    const intervalId = window.setInterval(updateSchedule, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isClient]);

  if (!isClient || !schedule) {
    return <PrayerTimesSkeleton />;
  }

  const rows = buildRows(schedule);
  const progressPercent = Math.round(schedule.intervalProgress * 1000) / 10;

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cozyCard}
    >
      <div className="border-b border-stone-200/70 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">
                {schedule.city}
              </span>
            </div>
            <p className="mt-1 text-xs capitalize text-stone-400">
              {schedule.dateLabel}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100/80 text-emerald-700">
            <MoonStar className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700/80">
            {schedule.countdownLabel}
          </p>

          <p className="mt-2 text-4xl font-semibold tracking-tight text-stone-800 tabular-nums">
            {formatCountdown(schedule.countdownMs)}
          </p>

          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200/70">
              <motion.div
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-400"
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-stone-400 tabular-nums">
              <span>прошло {progressPercent.toFixed(0)}%</span>
              <span>в {schedule.nextPrayerTimeLabel}</span>
            </div>
          </div>
        </div>

        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 space-y-1.5"
        >
          {rows.map((row) => (
            <motion.li
              key={row.key}
              variants={rowVariants}
              className={`flex items-center justify-between rounded-3xl px-4 py-2.5 transition-colors ${
                row.isActive
                  ? "border border-emerald-200 bg-emerald-50 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.5)]"
                  : row.kind === "sun"
                    ? "bg-transparent"
                    : "bg-stone-50/80"
              }`}
            >
              <span className="flex items-center gap-2">
                {row.isActive && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-cozy-pulse" />
                )}
                {row.key === "sunrise" && (
                  <Sunrise className="h-3.5 w-3.5 text-amber-500/90" />
                )}
                {row.key === "sunset" && (
                  <Sunset className="h-3.5 w-3.5 text-amber-500/90" />
                )}
                <span
                  className={`text-sm ${
                    row.isActive
                      ? "font-semibold text-emerald-800"
                      : row.kind === "sun"
                        ? "text-xs font-medium uppercase tracking-wider text-stone-400"
                        : "font-medium text-stone-600"
                  }`}
                >
                  {row.label}
                </span>
                {row.isNext && (
                  <span className="rounded-full border border-amber-200 bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    далее
                  </span>
                )}
              </span>
              <span
                className={`text-sm tabular-nums ${
                  row.isActive
                    ? "font-semibold text-emerald-800"
                    : row.kind === "sun"
                      ? "text-xs text-stone-400"
                      : "text-stone-500"
                }`}
              >
                {row.timeLabel}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.section>
  );
}
