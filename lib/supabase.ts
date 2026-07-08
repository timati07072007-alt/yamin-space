import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

let browserClient: SupabaseClient | null = null;
let configWarningLogged = false;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function getSupabaseConfigError(): string | null {
  const missing: string[] = [];

  if (!readEnv(SUPABASE_URL_KEY)) {
    missing.push(SUPABASE_URL_KEY);
  }

  if (!readEnv(SUPABASE_ANON_KEY)) {
    missing.push(SUPABASE_ANON_KEY);
  }

  if (missing.length === 0) {
    return null;
  }

  return `[Supabase] Missing environment variable(s): ${missing.join(", ")}`;
}

/** Returns null instead of throwing — safe for optional Realtime features. */
export function getSupabaseOrNull(): SupabaseClient | null {
  const configError = getSupabaseConfigError();

  if (configError) {
    if (!configWarningLogged) {
      console.warn(configError);
      configWarningLogged = true;
    }
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      readEnv(SUPABASE_URL_KEY)!,
      readEnv(SUPABASE_ANON_KEY)!,
    );
  }

  return browserClient;
}

/** @deprecated Prefer getSupabaseOrNull() for client-side optional features. */
export function getSupabase(): SupabaseClient {
  const client = getSupabaseOrNull();

  if (!client) {
    throw new Error(getSupabaseConfigError() ?? "Supabase is not configured");
  }

  return client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigError() === null;
}
