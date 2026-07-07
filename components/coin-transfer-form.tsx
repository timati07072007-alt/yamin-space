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

  async function simulateTransfer(parsedAmount: number): Promise<TransferResult> {
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
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
      className="w-full max-w-sm overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-xl shadow-sky-100/70"
    >
      <div className="flex items-center gap-3 border-b border-sky-100/80 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white">
          <HandCoins className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-sky-800">
            Поделиться савабом
          </h2>
          <p className="text-xs text-sky-600/80">
            Максимум 50 монет одному человеку в сутки
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-600">
            ID получателя
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={receiverId}
            onChange={(event) => setReceiverId(event.target.value)}
            placeholder="Например, 123456789"
            disabled={isLoading || isDevMode}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-sky-400 disabled:bg-zinc-50 disabled:text-zinc-500"
          />
          {isDevMode && (
            <span className="text-xs text-amber-600">
              DEV-режим: получатель зафиксирован на {DEV_MOCK_RECEIVER_NAME}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-600">
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
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-sky-400 disabled:bg-zinc-50"
          />
        </label>

        {isDevMode && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-600">
              DEV: симуляция результата
            </span>
            <select
              value={devOutcome}
              onChange={(event) =>
                setDevOutcome(event.target.value as DevOutcome)
              }
              disabled={isLoading}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-sky-400"
            >
              <option value="success">Успешный перевод</option>
              <option value="limit">Ошибка: превышен лимит</option>
            </select>
          </label>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
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
              className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
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
              className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.section>
  );
}
