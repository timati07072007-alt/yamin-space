import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, description, category_age, content_url")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ books: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load books";

    console.error("[API /books]", message);

    return Response.json({ error: message }, { status: 500 });
  }
}
