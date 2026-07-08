"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import {
  ADHKAR_CATEGORY_LABELS,
  ADHKAR_ITEMS,
  customToTarget,
  presetToTarget,
  TASBIH_PRESETS,
  type AdhkarCategory,
  type DhikrTarget,
} from "@/lib/adhkar";
import { cozyCardClass } from "@/lib/animations";
import {
  createCustomDhikr,
  fetchCustomDhikrs,
  loadDevCustomDhikrs,
  saveDevCustomDhikr,
  type CustomDhikr,
} from "@/lib/custom-dhikr";
import { hapticImpact, hapticSelection, hapticSuccess } from "@/lib/haptic";

type View = "hub" | "tasbih" | "catalog";

export function AdhkarHub() {
  const [view, setView] = useState<View>("hub");

  if (view === "tasbih") {
    return <TasbihScreen onBack={() => setView("hub")} />;
  }

  if (view === "catalog") {
    return <AdhkarCatalog onBack={() => setView("hub")} />;
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <motion.button
        type="button"
        onClick={() => setView("tasbih")}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={`${cozyCardClass} flex items-center gap-4 px-5 py-5 text-left`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-amber-100 text-2xl shadow-inner">
          📿
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--theme-text)]">
            Счётчик зикров
          </p>
          <p className="text-xs text-[var(--theme-text-muted)]">
            Тасбих с круговым прогрессом и своими целями
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-emerald-500" />
      </motion.button>

      <motion.button
        type="button"
        onClick={() => setView("catalog")}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={`${cozyCardClass} flex items-center gap-4 px-5 py-5 text-left`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-2xl shadow-inner">
          📖
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--theme-text)]">
            Дуа и азкары
          </p>
          <p className="text-xs text-[var(--theme-text-muted)]">
            Утренние, вечерние, после намаза и из Корана
          </p>
        </div>
        <BookOpen className="h-5 w-5 text-amber-600" />
      </motion.button>
    </div>
  );
}

function TasbihScreen({ onBack }: { onBack: () => void }) {
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

    async function loadCustomDhikrs() {
      if (isDevMode || !dbUser?.id) {
        const list = loadDevCustomDhikrs();
        if (!cancelled) setCustomDhikrs(list);
        return;
      }

      try {
        const list = await fetchCustomDhikrs(dbUser.id);
        if (!cancelled) setCustomDhikrs(list);
      } catch {
        if (!cancelled) setCustomDhikrs([]);
      }
    }

    void loadCustomDhikrs();

    return () => {
      cancelled = true;
    };
  }, [dbUser, isDevMode]);

  const targets: DhikrTarget[] = useMemo(() => {
    const custom = customDhikrs.map(customToTarget);
    return [...custom, ...TASBIH_PRESETS.map(presetToTarget)];
  }, [customDhikrs]);

  const active = targets.find((t) => t.id === activeId) ?? targets[0];
  const progress = Math.min(count / active.target, 1);

  function tick() {
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
    <div className={`${cozyCardClass} px-5 py-5`}>
      <div className="mb-4 flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onBack}
          whileTap={{ scale: 0.95 }}
          className="rounded-full border border-[var(--theme-border)] p-2 text-[var(--theme-text-muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </motion.button>
        <Sparkles className="h-5 w-5 text-emerald-600" />
        <h2 className="text-sm font-semibold text-[var(--theme-text)]">
          Счётчик зикров
        </h2>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {targets.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => selectTarget(t.id)}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
              activeId === t.id
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50"
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
          className="flex items-center gap-0.5 rounded-full border border-dashed border-emerald-300 px-2.5 py-1 text-[10px] font-semibold text-emerald-700"
        >
          <Plus className="h-3 w-3" />
          Свой зикр
        </motion.button>
      </div>

      <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
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
            stroke="url(#tasbihGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            animate={{
              strokeDashoffset: 2 * Math.PI * 88 * (1 - progress),
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          <defs>
            <linearGradient id="tasbihGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </svg>

        <motion.button
          type="button"
          onClick={tick}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
          className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-amber-50 shadow-[0_16px_48px_-16px_rgba(16,185,129,0.5)] dark:from-emerald-950/50 dark:via-stone-900 dark:to-amber-950/30"
        >
          <motion.span
            key={popKey}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ type: "spring", stiffness: 500, damping: 12 }}
            className="text-4xl font-bold tabular-nums text-emerald-800 dark:text-emerald-300"
          >
            {count}
          </motion.span>
          <span className="text-[10px] text-[var(--theme-text-muted)]">
            / {active.target}
          </span>
        </motion.button>
      </div>

      {active.arabic && (
        <p dir="rtl" lang="ar" className="mt-4 text-center text-xl text-[var(--theme-text)]">
          {active.arabic}
        </p>
      )}
      <p className="mt-1 text-center text-xs italic text-[var(--theme-text-muted)]">
        {active.transliteration}
      </p>

      <motion.button
        type="button"
        onClick={reset}
        whileTap={{ scale: 0.95 }}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] py-2.5 text-xs font-medium text-[var(--theme-text-muted)]"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Сброс
      </motion.button>

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
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
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
                  className="mt-1 w-full rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2 text-sm outline-none focus:border-emerald-300"
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
                  className="mt-1 w-full rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2 text-sm outline-none focus:border-emerald-300"
                />
              </label>

              <label className="mb-4 block">
                <span className="text-xs text-[var(--theme-text-muted)]">
                  Цель (число)
                </span>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2 text-sm outline-none focus:border-emerald-300"
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
                {saving ? "Сохраняем..." : "Сохранить зикр"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdhkarCatalog({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<AdhkarCategory>("morning");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => ADHKAR_ITEMS.filter((item) => item.category === category),
    [category],
  );

  return (
    <div className={`${cozyCardClass} px-4 py-4`}>
      <div className="mb-3 flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onBack}
          whileTap={{ scale: 0.95 }}
          className="rounded-full border border-[var(--theme-border)] p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </motion.button>
        <BookOpen className="h-5 w-5 text-amber-600" />
        <h2 className="text-sm font-semibold text-[var(--theme-text)]">
          Дуа и азкары
        </h2>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {(Object.keys(ADHKAR_CATEGORY_LABELS) as AdhkarCategory[]).map((key) => (
          <motion.button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
              category === key
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/40"
                : "border-[var(--theme-border)] text-[var(--theme-text-muted)]"
            }`}
          >
            {ADHKAR_CATEGORY_LABELS[key]}
          </motion.button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((item) => (
          <li key={item.id}>
            <motion.button
              type="button"
              onClick={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-left"
            >
              <p className="text-sm font-medium text-[var(--theme-text)]">
                {item.title}
                {item.repeat && item.repeat > 1 && (
                  <span className="ml-1 text-xs text-emerald-600">
                    ×{item.repeat}
                  </span>
                )}
              </p>
              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p
                      dir="rtl"
                      lang="ar"
                      className="mt-2 text-lg leading-loose text-[var(--theme-text)]"
                    >
                      {item.arabic}
                    </p>
                    <p className="mt-1 text-xs italic text-[var(--theme-text-muted)]">
                      {item.transliteration}
                    </p>
                    <p className="mt-1 text-sm text-[var(--theme-text-muted)]">
                      {item.translation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </li>
        ))}
      </ul>
    </div>
  );
}
