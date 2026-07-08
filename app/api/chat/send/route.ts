import { createAdminSupabase } from "@/lib/supabase-admin";

interface Payload {
  userId: number;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const userId = Number(body.userId);
    const message = body.message?.trim() ?? "";

    if (!Number.isInteger(userId) || userId <= 0) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }

    if (message.length < 1 || message.length > 500) {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("display_name, avatar_id, first_name")
      .eq("id", userId)
      .maybeSingle();

    if (userError) throw new Error(userError.message);
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const displayName =
      (user.display_name as string | null) ??
      (user.first_name as string) ??
      "Искатель";

    const { data, error } = await supabase
      .from("global_chat")
      .insert({
        user_id: userId,
        display_name: displayName,
        avatar_id: (user.avatar_id as string) ?? "mosque",
        message,
      })
      .select("id, user_id, display_name, avatar_id, message, created_at")
      .single();

    if (error) throw new Error(error.message);

    return Response.json({ message: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
