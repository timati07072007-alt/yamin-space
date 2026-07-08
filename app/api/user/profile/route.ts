import { createAdminSupabase } from "@/lib/supabase-admin";

interface Payload {
  userId: number;
  displayName?: string;
  avatarId?: string;
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const userId = Number(body.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }

    const updates: Record<string, string> = {};

    if (body.displayName !== undefined) {
      const name = body.displayName.trim();
      if (name.length < 1 || name.length > 40) {
        return Response.json({ error: "Invalid name" }, { status: 400 });
      }
      updates.display_name = name;
    }

    if (body.avatarId !== undefined) {
      updates.avatar_id = body.avatarId;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    if (updates.avatar_id) {
      const { data: avatar } = await supabase
        .from("user_avatars")
        .select("id")
        .eq("id", updates.avatar_id)
        .maybeSingle();

      if (!avatar) {
        return Response.json({ error: "Unknown avatar" }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { data: diamonds } = await supabase
      .from("diamonds_balance")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    return Response.json({
      user: { ...data, diamonds: diamonds?.balance ?? 0 },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
