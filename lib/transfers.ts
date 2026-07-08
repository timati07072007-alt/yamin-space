export const DAILY_TRANSFER_LIMIT = 50;
export const DAILY_LIMIT_MESSAGE =
  "Превышен суточный лимит перевода (макс. 50 монет одному пользователю)";

export interface TransferResult {
  amount: number;
  senderCoins: number;
  receiverCoins: number;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Ошибка перевода");
  }
  return payload;
}

export async function transferCoins(
  senderId: number,
  receiverId: number,
  amount: number,
): Promise<TransferResult> {
  const response = await fetch("/api/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId, receiverId, amount }),
  });

  return readJson<TransferResult>(response);
}
