import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from("hadiths")
      .select("id, text_ru, author, collection, authenticity")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ hadiths: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load hadiths";

    console.error("[API /hadiths]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
