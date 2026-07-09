import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export function createAdminSupabase(): SupabaseClient {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel.",
    );
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
