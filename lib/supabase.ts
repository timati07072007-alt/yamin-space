import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

let browserClient: SupabaseClient | null = null;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
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

export function getSupabase(): SupabaseClient {
  const configError = getSupabaseConfigError();

  if (configError) {
    console.error(configError);
    throw new Error(configError);
  }

  if (!browserClient) {
    browserClient = createClient(
      readEnv(SUPABASE_URL_KEY)!,
      readEnv(SUPABASE_ANON_KEY)!,
    );
  }

  return browserClient;
}
