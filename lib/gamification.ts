export type LeagueTier = "bronze" | "silver" | "gold" | "emerald";

export interface LeagueDefinition {
  id: LeagueTier;
  name_ru: string;
  min_weekly_xp: number;
  sort_order: number;
  color_hex: string;
}

export interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  avatar_id: string;
  avatar_emoji: string;
  weekly_xp: number;
  league_tier: LeagueTier;
  rank: number;
}

export interface UserAvatar {
  id: string;
  label_ru: string;
  emoji: string;
  gradient_from: string;
  gradient_to: string;
  sort_order: number;
}

export const LEAGUE_LABELS: Record<LeagueTier, string> = {
  bronze: "Бронза",
  silver: "Серебро",
  gold: "Золото",
  emerald: "Изумруд",
};

export function resolveLeagueTier(weeklyXp: number): LeagueTier {
  if (weeklyXp >= 800) return "emerald";
  if (weeklyXp >= 400) return "gold";
  if (weeklyXp >= 150) return "silver";
  return "bronze";
}

export function getBishkekWeekKey(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bishkek",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const date = new Date(now);
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diff);
  return formatter.format(date);
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Ошибка запроса");
  }
  return payload;
}

export async function fetchLeagues(): Promise<LeagueDefinition[]> {
  const response = await fetch("/api/leagues");
  const payload = await readJson<{ leagues: LeagueDefinition[] }>(response);
  return payload.leagues;
}

export async function fetchLeaderboard(
  tier: LeagueTier,
): Promise<LeaderboardEntry[]> {
  const response = await fetch(`/api/leagues/leaderboard?tier=${tier}`);
  const payload = await readJson<{ entries: LeaderboardEntry[] }>(response);
  return payload.entries;
}

export async function fetchAvatars(): Promise<UserAvatar[]> {
  const response = await fetch("/api/avatars");
  const payload = await readJson<{ avatars: UserAvatar[] }>(response);
  return payload.avatars;
}
