"use client";

import { motion } from "framer-motion";

import { DailyInspiration } from "@/components/daily-inspiration";
import { DailyQuiz } from "@/components/daily-quiz";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";
import { QiblaCompass } from "@/components/qibla-compass";
import { staggerContainer, staggerItem } from "@/lib/animations";

export function HomeHub() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-5"
    >
      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <PrayerTimesWidget />
      </motion.div>
      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <DailyInspiration />
      </motion.div>
      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <DailyQuiz />
      </motion.div>
      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <QiblaCompass />
      </motion.div>
    </motion.div>
  );
}
