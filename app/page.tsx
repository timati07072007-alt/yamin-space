"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { BottomNav, type TabId } from "@/components/bottom-nav";
import { AcademyHub } from "@/components/academy-hub";
import { ArabicHub } from "@/components/arabic-hub";
import { HomeHub } from "@/components/home-hub";
import { LibraryHub } from "@/components/library-hub";
import { ProfileHub } from "@/components/profile-hub";
import { useTelegram } from "@/components/telegram-provider";
import { pageVariants } from "@/lib/animations";
import { normalizeDbUser } from "@/lib/users";

export default function Home() {
  const { dbUser, isReady, isDevMode, syncError } = useTelegram();

  if (!isReady) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-sm text-stone-400"
        >
          Загрузка профиля...
        </motion.p>
      </main>
    );
  }

  if (syncError) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center">
          <p className="font-medium text-red-700">Ошибка синхронизации</p>
          <p className="mt-2 text-sm text-red-500">{syncError}</p>
        </div>
      </main>
    );
  }

  if (!dbUser) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <p className="text-stone-400">Данные пользователя недоступны.</p>
      </main>
    );
  }

  return (
    <AppShell dbUser={normalizeDbUser(dbUser)} isDevMode={isDevMode} />
  );
}

function AppShell({
  dbUser,
  isDevMode,
}: {
  dbUser: ReturnType<typeof normalizeDbUser>;
  isDevMode: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  return (
    <>
      <main className="flex min-h-full flex-1 flex-col items-center p-4 pb-28 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex w-full flex-col items-center"
          >
            {activeTab === "home" && <HomeHub />}
            {activeTab === "arabic" && <ArabicHub />}
            {activeTab === "academy" && <AcademyHub />}
            {activeTab === "library" && <LibraryHub />}
            {activeTab === "profile" && (
              <ProfileHub dbUser={dbUser} isDevMode={isDevMode} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}
