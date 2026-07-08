"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import { cozyCardClass, staggerContainer, staggerItem } from "@/lib/animations";
import {
  createCustomDhikr,
  fetchCustomDhikrs,
  loadDevCustomDhikrs,
  saveDevCustomDhikr,
  type CustomDhikr,
} from "@/lib/custom-dhikr";
import { hapticImpact, hapticSelection, hapticSuccess } from "@/lib/haptic";
import {
  customToTarget,
  presetToTarget,
  TASBIH_PRESETS,
  type DhikrTarget,
} from "@/lib/tasbih";

export function TasbihHub() {
  const { dbUser, isDevMode } = useTelegram();
  const [customDhikrs, setCustomDhikrs] = useState<CustomDhikr[]>([]);
  const [activeId, setActiveId] = useState<string>("subhan");
  const [count, setCount] = useState(0);
  const [popKey, setPopKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formTranslit, setFormTranslit] = useState("");
  const [formTarget, setFormTarget] = useState("33");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isDevMode || !dbUser?.id) {
        if (!cancelled) setCustomDhikrs(loadDevCustomDhikrs());
        return;
      }
      try {
        const list = await fetchCustomDhikrs(dbUser.id);
        if (!cancelled) setCustomDhikrs(list);
      } catch {
        if (!cancelled) setCustomDhikrs([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [dbUser, isDevMode]);

  const targets: DhikrTarget[] = useMemo(() => {
    const custom = customDhikrs.map(customToTarget);
    return [...custom, ...TASBIH_PRESETS.map(presetToTarget)];
  }, [customDhikrs]);

  const active = targets.find((t) => t.id === activeId) ?? targets[0];
  const progress = active ? Math.min(count / active.target, 1) : 0;

  function tick() {
    if (!active) return;
    hapticImpact("medium");
    setPopKey((k) => k + 1);
    setCount((c) => {
      const next = c + 1;
      if (next >= active.target) hapticSuccess();
      return next;
    });
  }

  function reset() {
    hapticSelection();
    setCount(0);
  }

  function selectTarget(id: string) {
    hapticSelection();
    setActiveId(id);
    setCount(0);
  }

  async function handleCreate() {
    const title = formTitle.trim();
    const transliteration = formTranslit.trim();
    const targetCount = Number(formTarget);

    if (title.length < 2) {
      setFormError("Введите название зикра");
      return;
    }
    if (transliteration.length < 2) {
      setFormError("Введите транскрипцию");
      return;
    }
    if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > 9999) {
      setFormError("Цель — число от 1 до 9999");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (isDevMode || !dbUser?.id) {
        const item = saveDevCustomDhikr({ title, transliteration, targetCount });
        setCustomDhikrs((prev) => [item, ...prev]);
        setActiveId(`custom-${item.id}`);
      } else {
        const item = await createCustomDhikr({
          userId: dbUser.id,
          title,
          transliteration,
          targetCount,
        });
        setCustomDhikrs((prev) => [item, ...prev]);
        setActiveId(`custom-${item.id}`);
      }
      setShowModal(false);
      setFormTitle("");
      setFormTranslit("");
      setFormTarget("33");
      setCount(0);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center gap-4"
    >
      <motion.section
        variants={staggerItem}
        className={`${cozyCardClass} max-w-sm px-5 py-5`}
      >
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--theme-text)]">
              Тасбих
            </h2>
            <p className="text-[10px] text-[var(--theme-text-muted)]">
              Счётчик зикров с целью
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {targets.map((t) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => selectTarget(t.id)}
              whileTap={{ scale: 0.95 }}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                activeId === t.id
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm dark:bg-emerald-950/50"
                  : "border-[var(--theme-border)] text-[var(--theme-text-muted)]"
              }`}
            >
              {t.isCustom ? "★ " : ""}
              {t.label}
            </motion.button>
          ))}
          <motion.button
            type="button"
            onClick={() => setShowModal(true)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-0.5 rounded-full border border-dashed border-emerald-400 px-2.5 py-1 text-[10px] font-semibold text-emerald-700"
          >
            <Plus className="h-3 w-3" />
            Свой
          </motion.button>
        </div>

        {active && (
          <>
            <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  fill="none"
                  stroke="var(--theme-ring-track)"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  fill="none"
                  stroke="url(#tasbihGradMain)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 96}`}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 96 * (1 - progress),
                  }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                />
                <defs>
                  <linearGradient id="tasbihGradMain" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>

              <motion.button
                type="button"
                onClick={tick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.88 }}
                className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-amber-50 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.55)] dark:from-emerald-950/60 dark:via-stone-900 dark:to-amber-950/40"
              >
                <motion.span
                  key={popKey}
                  initial={{ scale: 0.85 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ type: "spring", stiffness: 600, damping: 14 }}
                  className="text-5xl font-bold tabular-nums text-emerald-800 dark:text-emerald-300"
                >
                  {count}
                </motion.span>
                <span className="text-xs text-[var(--theme-text-muted)]">
                  из {active.target}
                </span>
              </motion.button>
            </div>

            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              {active.meaning && (
                <p className="text-sm font-medium text-[var(--theme-text)]">
                  {active.meaning}
                </p>
              )}
              {active.arabic && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="mt-2 text-2xl leading-relaxed text-[var(--theme-text)]"
                >
                  {active.arabic}
                </p>
              )}
              <p className="mt-1 text-sm italic text-[var(--theme-text-muted)]">
                {active.transliteration}
              </p>
            </motion.div>

            <motion.button
              type="button"
              onClick={reset}
              whileTap={{ scale: 0.95 }}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] py-3 text-xs font-medium text-[var(--theme-text-muted)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Сбросить счётчик
            </motion.button>
          </>
        )}
      </motion.section>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 48, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 48, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="w-full max-w-sm rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-[var(--theme-text)]">
                  Создать свой зикр
                </p>
                <button type="button" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4 text-[var(--theme-text-muted)]" />
                </button>
              </div>

              <label className="mb-3 block">
                <span className="text-xs text-[var(--theme-text-muted)]">
                  Название
                </span>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Например: Ля иляха илля Аллаh"
                  className="mt-1 w-full rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                />
              </label>

              <label className="mb-3 block">
                <span className="text-xs text-[var(--theme-text-muted)]">
                  Русская транскрипция
                </span>
                <input
                  value={formTranslit}
                  onChange={(e) => setFormTranslit(e.target.value)}
                  placeholder="Ля и-ля-hа ил-ля Ал-лаh"
                  className="mt-1 w-full rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                />
              </label>

              <label className="mb-4 block">
                <span className="text-xs text-[var(--theme-text-muted)]">
                  Цель
                </span>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                />
              </label>

              {formError && (
                <p className="mb-2 text-xs text-red-500">{formError}</p>
              )}

              <motion.button
                type="button"
                disabled={saving}
                onClick={() => void handleCreate()}
                whileTap={{ scale: 0.95 }}
                className="w-full rounded-3xl bg-emerald-500 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Сохраняем..." : "Сохранить"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
