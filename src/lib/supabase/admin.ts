import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key. It bypasses
 * Row Level Security, so it is used by the daily content cron job to
 * insert shared learning content.
 *
 * NEVER import this into a Client Component — the service-role key must
 * stay on the server.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
