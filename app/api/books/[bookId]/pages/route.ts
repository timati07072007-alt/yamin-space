import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const { bookId } = await params;
    const parsed = Number(bookId);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return Response.json({ error: "Invalid book id" }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("books_pages")
      .select("id, book_id, page_number, content_html, illustration_url")
      .eq("book_id", parsed)
      .order("page_number", { ascending: true });

    if (error) throw new Error(error.message);

    return Response.json({ pages: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
