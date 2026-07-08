import { createAdminSupabase } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const userId = Number(searchParams.get("userId"));
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 30);
    const search = searchParams.get("search")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 30), 1), 100);

    const supabase = createAdminSupabase();

    if (mode === "learn") {
      if (!Number.isInteger(userId) || userId <= 0) {
        return Response.json({ error: "Invalid user" }, { status: 400 });
      }

      const { data: due } = await supabase
        .from("arabic_word_progress")
        .select("word_id")
        .eq("user_id", userId)
        .lte("next_review_at", new Date().toISOString())
        .limit(limit);

      const dueIds = (due ?? []).map((r) => r.word_id as number);

      if (dueIds.length >= limit) {
        const { data: words } = await supabase
          .from("arabic_words")
          .select("*")
          .in("id", dueIds)
          .eq("is_active", true);
        return Response.json({ words: words ?? [] });
      }

      const remaining = limit - dueIds.length;
      let query = supabase
        .from("arabic_words")
        .select("*")
        .eq("is_active", true)
        .order("word_frequency", { ascending: false })
        .limit(remaining);

      if (dueIds.length > 0) {
        query = query.not("id", "in", `(${dueIds.join(",")})`);
      }

      const { data: fresh } = await query;

      if (dueIds.length > 0) {
        const { data: dueWords } = await supabase
          .from("arabic_words")
          .select("*")
          .in("id", dueIds);
        return Response.json({ words: [...(dueWords ?? []), ...(fresh ?? [])] });
      }

      return Response.json({ words: fresh ?? [] });
    }

    let query = supabase
      .from("arabic_words")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("word_frequency", { ascending: false });

    if (category && category !== "Все") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(
        `arabic.ilike.%${search}%,transliteration.ilike.%${search}%,translation_ru.ilike.%${search}%`,
      );
    }

    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return Response.json({
      words: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
