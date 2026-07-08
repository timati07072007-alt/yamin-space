"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coins, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";

import { BottomNav, type TabId } from "@/components/bottom-nav";
import { CoinTransferForm } from "@/components/coin-transfer-form";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";
import { QiblaCompass } from "@/components/qibla-compass";
import { QuizWizard } from "@/components/quiz-wizard";
import { useTelegram } from "@/components/telegram-provider";
import type { DbUser } from "@/lib/users";

export default function Home() {
  const { dbUser, isReady, isDevMode, syncError } = useTelegram();

  if (!isReady) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm tracking-wide text-zinc-500"
        >
          Загрузка профиля...
        </motion.p>
      </main>
    );
  }

  if (syncError) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border border-red-400/20 bg-red-950/40 p-6 text-center backdrop-blur-xl">
          <p className="font-medium text-red-300">Ошибка синхронизации</p>
          <p className="mt-2 text-sm text-red-400/80">{syncError}</p>
        </div>
      </main>
    );
  }

  if (!dbUser) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <p className="text-zinc-500">Данные пользователя недоступны.</p>
      </main>
    );
  }

  return <HomeContent dbUser={dbUser} isDevMode={isDevMode} />;
}

interface HomeContentProps {
  dbUser: DbUser;
  isDevMode: boolean;
}

const screenVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

function HomeContent({ dbUser, isDevMode }: HomeContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <>
      <main className="flex min-h-full flex-1 flex-col items-center p-5 pb-24 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex w-full flex-col items-center gap-5"
            >
              <ProfileCard dbUser={dbUser} isDevMode={isDevMode} />
              <CoinTransferForm sender={dbUser} isDevMode={isDevMode} />
            </motion.div>
          )}

          {activeTab === "prayer" && (
            <motion.div
              key="prayer"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex w-full flex-col items-center gap-5"
            >
              <PrayerTimesWidget />
              <QiblaCompass />
            </motion.div>
          )}

          {activeTab === "knowledge" && (
            <motion.div
              key="knowledge"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex w-full flex-col items-center gap-5"
            >
              <QuizWizard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}

interface ProfileCardProps {
  dbUser: DbUser;
  isDevMode: boolean;
}

function ProfileCard({ dbUser, isDevMode }: ProfileCardProps) {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      {isDevMode && (
        <div className="border-b border-amber-400/15 bg-amber-400/10 px-5 py-2.5 text-center text-xs font-medium text-amber-300">
          Режим разработки: {dbUser.first_name} | XP: {dbUser.xp} | Монеты:{" "}
          {dbUser.coins}
        </div>
      )}

      <div className="flex flex-col items-center gap-6 px-6 py-8">
        <div className="relative">
          <div className="absolute -inset-2 rounded-full bg-emerald-400/20 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/25 bg-gradient-to-br from-emerald-500/30 to-emerald-900/50 text-emerald-100">
            <UserRound className="h-9 w-9" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            {dbUser.first_name}
          </h1>
          {dbUser.username && (
            <p className="mt-1 text-sm text-zinc-500">@{dbUser.username}</p>
          )}
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1 text-sm font-medium text-amber-200">
            <Sparkles className="h-3.5 w-3.5" />
            {dbUser.title}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border border-white/5 bg-white/5 p-4"
          >
            <div className="mb-1.5 flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                XP
              </span>
            </div>
            <p className="text-2xl font-semibold text-zinc-50 tabular-nums">
              {dbUser.xp}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border border-white/5 bg-white/5 p-4"
          >
            <div className="mb-1.5 flex items-center gap-2 text-amber-300">
              <Coins className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Монеты
              </span>
            </div>
            <p className="text-2xl font-semibold text-zinc-50 tabular-nums">
              {dbUser.coins}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
