"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Gem, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useTelegram } from "@/components/telegram-provider";
import {
  fetchChatMessages,
  sendChatMessage,
  subscribeToChat,
  type ChatMessage,
} from "@/lib/chat";
import { cozyCardClass } from "@/lib/animations";

const DEV_CHAT: ChatMessage[] = [
  {
    id: 1,
    user_id: 0,
    display_name: "Модератор",
    avatar_id: "mosque",
    message: "Добро пожаловать в чат Искателей! Будьте вежливы 🤲",
    created_at: new Date().toISOString(),
  },
];

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function GlobalChat() {
  const { dbUser, isDevMode } = useTelegram();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = isDevMode ? DEV_CHAT : await fetchChatMessages(60);
        if (!cancelled) setMessages(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    if (isDevMode) {
      return () => {
        cancelled = true;
      };
    }

    const unsubscribe = subscribeToChat((message) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isDevMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !dbUser || sending) return;

    setSending(true);
    try {
      if (isDevMode) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            user_id: dbUser.id,
            display_name: dbUser.display_name ?? dbUser.first_name,
            avatar_id: dbUser.avatar_id,
            message: trimmed,
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        await sendChatMessage(dbUser.id, trimmed);
      }
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className={`${cozyCardClass} flex max-h-[28rem] flex-col`}>
      <div className="border-b border-stone-200/70 px-4 py-3">
        <h3 className="text-sm font-semibold text-stone-800">
          Глобальный чат Искателей
        </h3>
        <p className="text-xs text-stone-400">Realtime · Supabase</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {loading && (
          <div className="flex justify-center py-6 text-stone-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const mine = dbUser?.id === msg.user_id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-3.5 py-2.5 ${
                    mine
                      ? "rounded-br-md bg-emerald-500 text-white"
                      : "rounded-bl-md border border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  {!mine && (
                    <p className="mb-0.5 text-[10px] font-semibold text-emerald-700">
                      {msg.display_name}
                    </p>
                  )}
                  <p className="text-sm leading-snug">{msg.message}</p>
                  <p
                    className={`mt-1 text-[9px] ${
                      mine ? "text-emerald-100" : "text-stone-400"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-stone-200/70 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSend();
          }}
          placeholder="Напишите сообщение..."
          maxLength={500}
          className="flex-1 rounded-3xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-300"
        />
        <motion.button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || !text.trim()}
          whileTap={{ scale: 0.92 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </motion.button>
      </div>
    </section>
  );
}

export function DiamondsBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
      <Gem className="h-3.5 w-3.5" />
      {count}
    </span>
  );
}
