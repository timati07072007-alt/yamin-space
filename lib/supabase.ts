import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    const message = `[Supabase] Missing environment variable "${name}". Add it to .env.local and restart the dev server.`;
    console.error(message);
    throw new Error(message);
  }

  return value;
}

const supabaseUrl = requireEnv(SUPABASE_URL_KEY);
const supabaseAnonKey = requireEnv(SUPABASE_ANON_KEY);

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
);
