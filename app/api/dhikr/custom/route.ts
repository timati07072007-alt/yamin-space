import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));

    if (!Number.isInteger(userId) || userId <= 0) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_custom_dhikr")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return Response.json({ dhikrs: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

interface CreatePayload {
  userId: number;
  title: string;
  transliteration: string;
  targetCount: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePayload;
    const userId = Number(body.userId);
    const title = body.title?.trim() ?? "";
    const transliteration = body.transliteration?.trim() ?? "";
    const targetCount = Number(body.targetCount);

    if (!Number.isInteger(userId) || userId <= 0) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }
    if (title.length < 2 || title.length > 80) {
      return Response.json({ error: "Invalid title" }, { status: 400 });
    }
    if (transliteration.length < 2 || transliteration.length > 200) {
      return Response.json({ error: "Invalid transliteration" }, { status: 400 });
    }
    if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > 9999) {
      return Response.json({ error: "Invalid target" }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_custom_dhikr")
      .insert({
        user_id: userId,
        title,
        transliteration,
        target_count: targetCount,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return Response.json({ dhikr: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
