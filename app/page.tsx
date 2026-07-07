"use client";

import { motion } from "framer-motion";
import { Coins, Sparkles, UserRound } from "lucide-react";

import { CoinTransferForm } from "@/components/coin-transfer-form";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";
import { useTelegram } from "@/components/telegram-provider";
import type { DbUser } from "@/lib/users";

export default function Home() {
  const { dbUser, isReady, isDevMode, syncError } = useTelegram();

  if (!isReady) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <p className="text-zinc-500">Загрузка профиля...</p>
      </main>
    );
  }

  if (syncError) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <div className="max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-800">Ошибка синхронизации</p>
          <p className="mt-2 text-sm text-red-600">{syncError}</p>
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

function HomeContent({ dbUser, isDevMode }: HomeContentProps) {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-50 to-zinc-100 p-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60"
      >
        {isDevMode && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm font-medium text-amber-800">
            Режим разработки: {dbUser.first_name} | XP: {dbUser.xp} | Монеты:{" "}
            {dbUser.coins}
          </div>
        )}

        <div className="flex flex-col items-center gap-6 px-6 py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-white">
            <UserRound className="h-10 w-10" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-semibold text-zinc-900">
              {dbUser.first_name}
            </h1>
            {dbUser.username && (
              <p className="mt-1 text-zinc-500">@{dbUser.username}</p>
            )}
            <p className="mt-3 inline-flex rounded-full bg-zinc-100 px-4 py-1 text-sm font-medium text-zinc-700">
              {dbUser.title}
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl bg-violet-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-violet-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">XP</span>
              </div>
              <p className="text-2xl font-bold text-violet-900">{dbUser.xp}</p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-600">
                <Coins className="h-4 w-4" />
                <span className="text-sm font-medium">Монеты</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">
                {dbUser.coins}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <PrayerTimesWidget />

      <CoinTransferForm sender={dbUser} isDevMode={isDevMode} />
    </main>
  );
}
