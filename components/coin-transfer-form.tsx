"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, HandCoins, Loader2, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  DAILY_LIMIT_MESSAGE,
  transferCoins,
  type TransferResult,
} from "@/lib/transfers";
import type { DbUser } from "@/lib/users";

type TransferStatus = "idle" | "loading" | "success" | "error";

type DevOutcome = "success" | "limit";

const DEV_MOCK_RECEIVER_ID = 999_000_001;
const DEV_MOCK_RECEIVER_NAME = "MOCK-получатель";
const SIMULATION_DELAY_MS = 900;

const cozyCard =
  "w-full max-w-sm overflow-hidden rounded-[2rem] border border-amber-900/10 bg-white/75 shadow-[0_20px_50px_-24px_rgba(146,104,41,0.35)] backdrop-blur-xl";

const inputClass =
  "w-full rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-700 placeholder-stone-400 outline-none transition-all focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-200/60 disabled:cursor-not-allowed disabled:opacity-50";

interface CoinTransferFormProps {
  sender: DbUser;
  isDevMode: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function CoinTransferForm({ sender, isDevMode }: CoinTransferFormProps) {
  const [receiverId, setReceiverId] = useState(
    isDevMode ? String(DEV_MOCK_RECEIVER_ID) : "",
  );
  const [amount, setAmount] = useState("");
  const [devOutcome, setDevOutcome] = useState<DevOutcome>("success");
  const [status, setStatus] = useState<TransferStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const isLoading = status === "loading";

  async function simulateTransfer(
    parsedAmount: number,
  ): Promise<TransferResult> {
    await delay(SIMULATION_DELAY_MS);

    if (devOutcome === "limit") {
      throw new Error(DAILY_LIMIT_MESSAGE);
    }

    return {
      amount: parsedAmount,
      senderCoins: Math.max(0, sender.coins - parsedAmount),
      receiverCoins: parsedAmount,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    const parsedReceiverId = Number(receiverId);

    if (!Number.isInteger(parsedReceiverId) || parsedReceiverId <= 0) {
      setStatus("error");
      setMessage("Укажите корректный ID получателя");
      return;
    }

    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      setStatus("error");
      setMessage("Количество монет должно быть целым числом больше нуля");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = isDevMode
        ? await simulateTransfer(parsedAmount)
        : await transferCoins(sender.id, parsedReceiverId, parsedAmount);

      setStatus("success");
      setMessage(
        `Переведено ${result.amount} монет. Ваш баланс: ${result.senderCoins}`,
      );
      setAmount("");
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Не удалось выполнить перевод";
      setStatus("error");
      setMessage(text);
    }
  }

  return (
    <section className={cozyCard}>
      <div className="flex items-center gap-3 border-b border-stone-200/70 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100/80 text-amber-700">
          <HandCoins className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-stone-700">
            Поделиться савабом
          </h2>
          <p className="text-xs text-stone-400">
            Максимум 50 монет одному человеку в сутки
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
            ID получателя
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={receiverId}
            onChange={(event) => setReceiverId(event.target.value)}
            placeholder="Например, 123456789"
            disabled={isLoading || isDevMode}
            className={inputClass}
          />
          {isDevMode && (
            <span className="text-xs text-amber-600">
              DEV-режим: получатель зафиксирован на {DEV_MOCK_RECEIVER_NAME}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
            Количество монет
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            disabled={isLoading}
            className={inputClass}
          />
        </label>

        {isDevMode && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
              DEV: симуляция результата
            </span>
            <select
              value={devOutcome}
              onChange={(event) =>
                setDevOutcome(event.target.value as DevOutcome)
              }
              disabled={isLoading}
              className={`${inputClass} appearance-none`}
            >
              <option value="success">Успешный перевод</option>
              <option value="limit">Ошибка: превышен лимит</option>
            </select>
          </label>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition-colors hover:from-emerald-500 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Отправляем...
            </>
          ) : (
            <>
              <HandCoins className="h-4 w-4" />
              Поделиться савабом
            </>
          )}
        </motion.button>

        <AnimatePresence mode="wait">
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </section>
  );
}
