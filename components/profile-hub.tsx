"use client";

import { motion } from "framer-motion";
import { Coins, Gem, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { CoinTransferForm } from "@/components/coin-transfer-form";
import { DiamondsBadge, GlobalChat } from "@/components/global-chat";
import { LeagueLeaderboard } from "@/components/league-leaderboard";
import { SupportCreator } from "@/components/support-creator";
import { useTelegram } from "@/components/telegram-provider";
import { APP_THEMES, useTheme } from "@/components/theme-provider";
import {
  fetchAvatars,
  LEAGUE_LABELS,
  type UserAvatar,
} from "@/lib/gamification";
import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";
import { updateUserProfile, type DbUser } from "@/lib/users";

interface ProfileHubProps {
  dbUser: DbUser;
  isDevMode: boolean;
}

export function ProfileHub({ dbUser, isDevMode }: ProfileHubProps) {
  const { patchUser } = useTelegram();
  const { themeId, setThemeId } = useTheme();
  const [avatars, setAvatars] = useState<UserAvatar[]>([]);
  const [name, setName] = useState(dbUser.display_name ?? dbUser.first_name);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchAvatars().then(setAvatars).catch(() => setAvatars([]));
  }, []);

  const currentAvatar =
    avatars.find((a) => a.id === dbUser.avatar_id) ?? avatars[0];

  async function saveProfile(avatarId?: string) {
    if (isDevMode) {
      patchUser({
        display_name: name.trim() || dbUser.first_name,
        avatar_id: avatarId ?? dbUser.avatar_id,
      });
      setMessage("Сохранено (DEV)");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUserProfile(dbUser.id, {
        displayName: name.trim(),
        avatarId,
      });
      patchUser(updated);
      setMessage("Профиль обновлён");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-5"
    >
      <motion.section variants={staggerItem} className={`${cozyCardClass} max-w-sm px-6 py-6`}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 text-4xl shadow-inner"
            style={{
              background: `linear-gradient(135deg, ${currentAvatar?.gradient_from ?? "#d1fae5"}, ${currentAvatar?.gradient_to ?? "#fef3c7"})`,
            }}
          >
            {currentAvatar?.emoji ?? "🕌"}
          </div>

          <div className="w-full text-center">
            <p className="text-xs text-stone-400">ID (неизменен)</p>
            <p className="font-mono text-sm text-stone-600">{dbUser.id}</p>
          </div>

          <label className="w-full">
            <span className="text-xs font-medium text-stone-500">Имя</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-3xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
            />
          </label>

          <motion.button
            type="button"
            disabled={saving}
            onClick={() => void saveProfile()}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-3xl border border-emerald-300 bg-emerald-500 py-2.5 text-sm font-semibold text-white"
          >
            {saving ? "Сохраняем..." : "Сохранить имя"}
          </motion.button>

          {message && (
            <p className="text-xs text-emerald-700">{message}</p>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              {LEAGUE_LABELS[dbUser.league_tier]}
            </span>
            <DiamondsBadge count={dbUser.diamonds} />
          </div>

          <div className="grid w-full grid-cols-3 gap-2">
            <Stat label="XP" value={dbUser.xp} icon={Sparkles} />
            <Stat label="Монеты" value={dbUser.coins} icon={Coins} />
            <Stat label="Неделя" value={dbUser.weekly_xp} icon={Gem} />
          </div>
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className={`${cozyCardClass} max-w-sm px-4 py-4`}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
          Халяль-аватары
        </p>
        {avatars.length === 0 ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-stone-400" />
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {avatars.map((avatar) => (
              <motion.button
                key={avatar.id}
                type="button"
                onClick={() => void saveProfile(avatar.id)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className={`rounded-3xl border p-2 text-2xl ${
                  dbUser.avatar_id === avatar.id
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-stone-200 bg-white"
                }`}
                title={avatar.label_ru}
              >
                {avatar.emoji}
              </motion.button>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section variants={staggerItem} className={`${cozyCardClass} max-w-sm px-4 py-4`}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">
          Тема оформления
        </p>
        <div className="space-y-2">
          {APP_THEMES.map((theme) => (
            <motion.button
              key={theme.id}
              type="button"
              onClick={() => setThemeId(theme.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left ${
                themeId === theme.id
                  ? "border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40"
                  : "border-[var(--theme-border)] bg-[var(--theme-surface)]"
              }`}
            >
              <span
                className="h-10 w-10 shrink-0 rounded-full border border-white/60 shadow-inner"
                style={{ background: theme.preview }}
              />
              <div>
                <p className="text-sm font-semibold text-[var(--theme-text)]">
                  {theme.label}
                </p>
                <p className="text-[10px] text-[var(--theme-text-muted)]">
                  {theme.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <SupportCreator />
      </motion.div>

      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <LeagueLeaderboard />
      </motion.div>

      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <GlobalChat />
      </motion.div>

      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <CoinTransferForm sender={dbUser} isDevMode={isDevMode} />
      </motion.div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Sparkles;
}) {
  return (
    <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-2 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-emerald-600" />
      <p className="text-[10px] text-stone-400">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-stone-800">{value}</p>
    </div>
  );
}
