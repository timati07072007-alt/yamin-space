import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const limit = Math.min(
      100,
      Number(new URL(request.url).searchParams.get("limit") ?? 50),
    );

    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("global_chat")
      .select("id, user_id, display_name, avatar_id, message, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return Response.json({ messages: (data ?? []).reverse() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
