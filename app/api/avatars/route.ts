import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_avatars")
      .select("id, label_ru, emoji, gradient_from, gradient_to, sort_order")
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return Response.json({ avatars: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
