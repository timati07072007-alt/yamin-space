import type { Variants } from "framer-motion";

export const cozyCardClass =
  "w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-[0_20px_50px_-24px_var(--theme-card-shadow)] backdrop-blur-xl";

export const glassPanelClass =
  "rounded-3xl border border-white/60 bg-white/55 backdrop-blur-2xl shadow-[0_8px_32px_-12px_rgba(146,104,41,0.25)]";

export const breatheButton = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.96 },
  transition: { type: "spring" as const, stiffness: 420, damping: 18 },
};

export const springPop = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { type: "spring" as const, stiffness: 320, damping: 22 },
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

export const breatheHover = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 400, damping: 20 },
};
