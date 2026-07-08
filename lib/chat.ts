import { getSupabase } from "@/lib/supabase";

export interface ChatMessage {
  id: number;
  user_id: number;
  display_name: string;
  avatar_id: string;
  message: string;
  created_at: string;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Ошибка запроса");
  }
  return payload;
}

export async function fetchChatMessages(limit = 50): Promise<ChatMessage[]> {
  const response = await fetch(`/api/chat/messages?limit=${limit}`);
  const payload = await readJson<{ messages: ChatMessage[] }>(response);
  return payload.messages;
}

export async function sendChatMessage(
  userId: number,
  message: string,
): Promise<ChatMessage> {
  const response = await fetch("/api/chat/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message }),
  });
  const payload = await readJson<{ message: ChatMessage }>(response);
  return payload.message;
}

export function subscribeToChat(
  onInsert: (message: ChatMessage) => void,
): () => void {
  const supabase = getSupabase();

  const channel = supabase
    .channel("global_chat_live")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "global_chat" },
      (payload) => {
        onInsert(payload.new as ChatMessage);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
