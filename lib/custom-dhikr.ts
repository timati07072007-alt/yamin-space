export interface CustomDhikr {
  id: number;
  user_id: number;
  title: string;
  transliteration: string;
  target_count: number;
  created_at: string;
}

export interface CreateCustomDhikrPayload {
  userId: number;
  title: string;
  transliteration: string;
  targetCount: number;
}

const DEV_STORAGE_KEY = "yamin-dev-custom-dhikr";

export function loadDevCustomDhikrs(): CustomDhikr[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEV_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomDhikr[]) : [];
  } catch {
    return [];
  }
}

export function saveDevCustomDhikr(
  payload: Omit<CreateCustomDhikrPayload, "userId">,
): CustomDhikr {
  const list = loadDevCustomDhikrs();
  const item: CustomDhikr = {
    id: Date.now(),
    user_id: 0,
    title: payload.title,
    transliteration: payload.transliteration,
    target_count: payload.targetCount,
    created_at: new Date().toISOString(),
  };
  const next = [item, ...list];
  localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(next));
  return item;
}

export async function fetchCustomDhikrs(userId: number): Promise<CustomDhikr[]> {
  const response = await fetch(`/api/dhikr/custom?userId=${userId}`);
  const payload = (await response.json()) as {
    dhikrs?: CustomDhikr[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Не удалось загрузить зикры");
  }

  return payload.dhikrs ?? [];
}

export async function createCustomDhikr(
  payload: CreateCustomDhikrPayload,
): Promise<CustomDhikr> {
  const response = await fetch("/api/dhikr/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as {
    dhikr?: CustomDhikr;
    error?: string;
  };

  if (!response.ok || !data.dhikr) {
    throw new Error(data.error ?? "Не удалось сохранить зикр");
  }

  return data.dhikr;
}
