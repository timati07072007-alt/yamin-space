export interface BookPage {
  id: number;
  book_id: number;
  page_number: number;
  content_html: string;
  illustration_url: string | null;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Ошибка запроса");
  }
  return payload;
}

export async function fetchBookPages(bookId: number): Promise<BookPage[]> {
  const response = await fetch(`/api/books/${bookId}/pages`);
  const payload = await readJson<{ pages: BookPage[] }>(response);
  return payload.pages;
}
