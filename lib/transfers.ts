import { getSupabase } from "@/lib/supabase";

export const DAILY_TRANSFER_LIMIT = 50;
export const DAILY_LIMIT_MESSAGE =
  "Превышен суточный лимит перевода (макс. 50 монет одному пользователю)";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface TransferResult {
  amount: number;
  senderCoins: number;
  receiverCoins: number;
}

interface UserCoinsRow {
  id: number;
  coins: number;
}

interface TransferAmountRow {
  amount: number;
}

function assertValidAmount(amount: number): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Количество монет должно быть целым числом больше нуля");
  }
}

function readCoins(row: UserCoinsRow | null, userId: number): number {
  if (!row || typeof row.coins !== "number" || Number.isNaN(row.coins)) {
    throw new Error(`Не удалось получить баланс пользователя ${userId}`);
  }

  return row.coins;
}

async function getTransferredLast24h(
  senderId: number,
  receiverId: number,
): Promise<number> {
  const since = new Date(Date.now() - DAY_IN_MS).toISOString();

  const { data, error } = await getSupabase()
    .from("points_transfers")
    .select("amount")
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .gte("created_at", since);

  if (error) {
    throw new Error(error.message);
  }

  const transfers = (data || []) as TransferAmountRow[];

  return transfers.reduce((total, row) => {
    const value = typeof row.amount === "number" ? row.amount : 0;
    return total + value;
  }, 0);
}

async function fetchUserCoins(userId: number): Promise<number> {
  const { data, error } = await getSupabase()
    .from("users")
    .select("id, coins")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`Пользователь с ID ${userId} не найден`);
  }

  return readCoins(data as UserCoinsRow, userId);
}

async function updateUserCoins(userId: number, coins: number): Promise<void> {
  const { error } = await getSupabase()
    .from("users")
    .update({ coins })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function transferCoins(
  senderId: number,
  receiverId: number,
  amount: number,
): Promise<TransferResult> {
  assertValidAmount(amount);

  if (senderId === receiverId) {
    throw new Error("Нельзя перевести монеты самому себе");
  }

  const alreadyTransferred = await getTransferredLast24h(senderId, receiverId);

  if (alreadyTransferred + amount > DAILY_TRANSFER_LIMIT) {
    throw new Error(DAILY_LIMIT_MESSAGE);
  }

  const senderCoinsBefore = await fetchUserCoins(senderId);

  if (senderCoinsBefore < amount) {
    throw new Error("Недостаточно монет");
  }

  const receiverCoinsBefore = await fetchUserCoins(receiverId);

  const senderCoins = senderCoinsBefore - amount;
  const receiverCoins = receiverCoinsBefore + amount;

  await updateUserCoins(senderId, senderCoins);

  try {
    await updateUserCoins(receiverId, receiverCoins);
  } catch (error) {
    await updateUserCoins(senderId, senderCoinsBefore);
    throw error;
  }

  const { error: recordError } = await getSupabase()
    .from("points_transfers")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
    });

  if (recordError) {
    throw new Error(recordError.message);
  }

  return { amount, senderCoins, receiverCoins };
}
