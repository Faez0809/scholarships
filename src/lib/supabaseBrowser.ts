"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SUPABASE_URL, isValidHttpUrl } from "./supabase";

const DEFAULT_PUBLIC_KEY = "sb_publishable_fo6AHwwcCUyt7bJwfI_j-g_zpcaoEd4";

let browserClient: SupabaseClient | null = null;

/**
 * Browser-only Supabase client used for sign-in and each user's own data.
 * Uses the public key; Row-Level Security limits every user to their own rows.
 * Created lazily so it never runs during server rendering or the build.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (browserClient) return browserClient;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const url = isValidHttpUrl(rawUrl) ? rawUrl! : DEFAULT_SUPABASE_URL;
  const key = rawKey || DEFAULT_PUBLIC_KEY;
  try {
    browserClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "scholar_track_auth",
      },
    });
    return browserClient;
  } catch (err) {
    console.warn("Sign-in client could not start:", err);
    return null;
  }
}
