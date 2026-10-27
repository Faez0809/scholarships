import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://skuopdhtzyfcrvvjhkej.supabase.co";
const DEFAULT_SUPABASE_KEY =
  "sb_publishable_fo6AHwwcCUyt7bJwfI_j-g_zpcaoEd4";

function isValidHttpUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a configured Supabase client instance, or null if credentials are invalid or missing.
 * Uses lazy initialization so that Next.js static build evaluation never throws.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Validate or fallback to project default credentials
  const url = isValidHttpUrl(rawUrl) ? rawUrl! : DEFAULT_SUPABASE_URL;
  const key = rawKey && rawKey.length > 0 ? rawKey : DEFAULT_SUPABASE_KEY;

  if (!isValidHttpUrl(url) || !key) {
    return null;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn("Supabase client initialization warning:", err);
    return null;
  }
}

/**
 * Lazy proxy for direct imports: `import { supabase } from "@/lib/supabase"`.
 * Defers client creation until actual method invocation.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error(
        "Supabase client could not be initialized. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
