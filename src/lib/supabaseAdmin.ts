import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

/**
 * Server-only Supabase client for write operations.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY, which bypasses Row-Level Security, so it must
 * only ever be imported from API routes (never from client components).
 * The public anon key is read-only once supabase-schema.sql has been applied.
 *
 * Created lazily so that build-time page data collection never calls
 * createClient with empty credentials.
 */
let cachedAdminClient: SupabaseClient | null = null;
let warnedMissingServiceKey = false;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cachedAdminClient) return cachedAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (url && /^https?:\/\//.test(url) && serviceKey) {
    try {
      cachedAdminClient = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      return cachedAdminClient;
    } catch (err) {
      console.warn("Supabase service client initialization warning:", err);
    }
  }

  // Transitional fallback: until the service key is set, writes go through the
  // public client. This only works while the old open write policies exist.
  if (!warnedMissingServiceKey) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY is not set; database writes will fail once write access is locked down."
    );
    warnedMissingServiceKey = true;
  }
  return getSupabaseClient();
}
