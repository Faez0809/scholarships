import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SUPABASE_URL, getSupabaseClient, isValidHttpUrl } from "./supabase";

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

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  // Same fallback as the public client, so a missing URL variable does not
  // silently push writes onto the read-only public key.
  const url = isValidHttpUrl(rawUrl) ? rawUrl! : DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^["']|["']$/g, "");

  if (serviceKey) {
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

/** Which credentials the server would use for writes (no secret values). */
export function describeWriteConfig() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  return {
    serviceKeyPresent: key.length > 0,
    serviceKeyFormat: key.startsWith("sb_secret_")
      ? "secret"
      : key.startsWith("sb_publishable_")
      ? "publishable (wrong key)"
      : key.startsWith("eyJ")
      ? "jwt"
      : key
      ? "unrecognised"
      : "missing",
    urlVariablePresent: isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
  };
}
