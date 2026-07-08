import { createAdminSupabase } from "@/lib/supabase-admin";
import {
  DAILY_LIMIT_MESSAGE,
  DAILY_TRANSFER_LIMIT,
} from "@/lib/transfers-shared";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      senderId?: number;
      receiverId?: number;
      amount?: number;
    };

    const senderId = Number(body.senderId);
    const receiverId = Number(body.receiverId);
    const amount = Number(body.amount);

    if (!Number.isInteger(senderId) || senderId <= 0) {
      return Response.json({ error: "Invalid sender" }, { status: 400 });
    }

    if (!Number.isInteger(receiverId) || receiverId <= 0) {
      return Response.json({ error: "Invalid receiver" }, { status: 400 });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return Response.json(
        { error: "Количество монет должно быть целым числом больше нуля" },
        { status: 400 },
      );
    }

    if (senderId === receiverId) {
      return Response.json(
        { error: "Нельзя перевести монеты самому себе" },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabase();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recent, error: recentError } = await supabase
      .from("points_transfers")
      .select("amount")
      .eq("sender_id", senderId)
      .eq("receiver_id", receiverId)
      .gte("created_at", since);

    if (recentError) throw new Error(recentError.message);

    const transferred = (recent ?? []).reduce(
      (sum, row) => sum + (row.amount as number),
      0,
    );

    if (transferred + amount > DAILY_TRANSFER_LIMIT) {
      return Response.json({ error: DAILY_LIMIT_MESSAGE }, { status: 400 });
    }

    const { data: sender, error: senderError } = await supabase
      .from("users")
      .select("coins")
      .eq("id", senderId)
      .maybeSingle();

    if (senderError) throw new Error(senderError.message);
    if (!sender) {
      return Response.json({ error: "Отправитель не найден" }, { status: 404 });
    }

    const senderCoinsBefore = sender.coins as number;
    if (senderCoinsBefore < amount) {
      return Response.json({ error: "Недостаточно монет" }, { status: 400 });
    }

    const { data: receiver, error: receiverError } = await supabase
      .from("users")
      .select("coins")
      .eq("id", receiverId)
      .maybeSingle();

    if (receiverError) throw new Error(receiverError.message);
    if (!receiver) {
      return Response.json({ error: "Получатель не найден" }, { status: 404 });
    }

    const receiverCoinsBefore = receiver.coins as number;
    const senderCoins = senderCoinsBefore - amount;
    const receiverCoins = receiverCoinsBefore + amount;

    const { error: debitError } = await supabase
      .from("users")
      .update({ coins: senderCoins })
      .eq("id", senderId);

    if (debitError) throw new Error(debitError.message);

    const { error: creditError } = await supabase
      .from("users")
      .update({ coins: receiverCoins })
      .eq("id", receiverId);

    if (creditError) {
      await supabase
        .from("users")
        .update({ coins: senderCoinsBefore })
        .eq("id", senderId);
      throw new Error(creditError.message);
    }

    const { error: recordError } = await supabase.from("points_transfers").insert({
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
    });

    if (recordError) throw new Error(recordError.message);

    return Response.json({ amount, senderCoins, receiverCoins });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transfer failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
