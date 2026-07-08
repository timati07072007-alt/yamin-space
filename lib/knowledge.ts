export type BookAgeCategory = "children" | "teens" | "adults";

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  category_age: BookAgeCategory;
  content_url: string | null;
  /** Полный текст книги для встроенного ридера. */
  content_text: string | null;
}

export type HadithAuthenticity = "sahih" | "hasan" | "daif";

export interface Hadith {
  id: number;
  text_ru: string;
  author: string;
  collection: string;
  authenticity: HadithAuthenticity;
}

export const AGE_CATEGORY_LABELS: Record<BookAgeCategory, string> = {
  children: "Детям",
  teens: "Подросткам",
  adults: "Взрослым",
};

export const AUTHENTICITY_LABELS: Record<HadithAuthenticity, string> = {
  sahih: "Сахих",
  hasan: "Хасан",
  daif: "Даиф",
};

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Ошибка запроса к серверу");
  }

  return payload;
}

export async function fetchBooks(): Promise<Book[]> {
  const response = await fetch("/api/books");
  const payload = await readJson<{ books: Book[] }>(response);
  return payload.books;
}

export async function fetchHadiths(): Promise<Hadith[]> {
  const response = await fetch("/api/hadiths");
  const payload = await readJson<{ hadiths: Hadith[] }>(response);
  return payload.hadiths;
}
