import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("leagues")
      .select("id, name_ru, min_weekly_xp, sort_order, color_hex")
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return Response.json({ leagues: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
