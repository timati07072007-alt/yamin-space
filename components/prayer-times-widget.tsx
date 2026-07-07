"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, MoonStar } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import {
  formatCountdown,
  getPrayerSchedule,
  type PrayerSchedule,
} from "@/lib/prayer-times";

const PRAYER_SKELETON_ROWS = 5;

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function PrayerTimesSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="w-full max-w-sm overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-xl shadow-emerald-100/70"
    >
      <div className="border-b border-emerald-100/80 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded-full bg-emerald-100" />
            <div className="h-3 w-36 animate-pulse rounded-full bg-emerald-100/80" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-emerald-100" />
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-2xl bg-emerald-100 px-4 py-3">
          <div className="h-4 w-28 animate-pulse rounded-full bg-emerald-200/80" />
          <div className="mt-3 h-9 w-32 animate-pulse rounded-lg bg-emerald-200/80" />
        </div>

        <ul className="mt-4 space-y-2">
          {Array.from({ length: PRAYER_SKELETON_ROWS }, (_, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2.5"
            >
              <div className="h-4 w-16 animate-pulse rounded-full bg-emerald-100" />
              <div className="h-4 w-12 animate-pulse rounded-full bg-emerald-100/80" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
      className="w-full max-w-sm overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-xl shadow-emerald-100/70"
    >
      <div className="border-b border-emerald-100/80 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-semibold">{schedule.city}</span>
            </div>
            <p className="mt-1 text-xs capitalize text-emerald-600/80">
              {schedule.dateLabel}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <MoonStar className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-2xl bg-emerald-600 px-4 py-3 text-white">
          <div className="flex items-center gap-2 text-emerald-100">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{schedule.countdownLabel}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={formatCountdown(schedule.countdownMs)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mt-1 font-mono text-3xl font-bold tracking-wider"
            >
              {formatCountdown(schedule.countdownMs)}
            </motion.p>
          </AnimatePresence>
        </div>

        <ul className="mt-4 space-y-2">
          {schedule.prayers.map((prayer) => {
            const isActive = schedule.currentPrayer === prayer.name;

            return (
              <motion.li
                key={prayer.name}
                layout
                className={`flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-white/70 text-zinc-700"
                }`}
              >
                <span
                  className={`text-sm font-medium ${isActive ? "text-white" : ""}`}
                >
                  {prayer.label}
                </span>
                <span
                  className={`font-mono text-sm ${
                    isActive ? "text-emerald-50" : "text-zinc-500"
                  }`}
                >
                  {prayer.timeLabel}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </motion.section>
  );
}
