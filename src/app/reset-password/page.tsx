"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { PasswordInput } from "@/components/PasswordInput";

/**
 * Opened from the reset email. Supabase signs the visitor in from the link
 * (recovery session), then they choose a new password here.
 */
export default function ResetPasswordPage() {
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<false | "changed" | "unchanged">(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setTimeout(() => setReady("invalid"), 0);
      return;
    }
    let settled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        settled = true;
        setReady("ok");
      }
    });
    // The link may already have been handled before this listener was attached.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        settled = true;
        setReady("ok");
      }
    });
    const timer = window.setTimeout(() => {
      if (!settled) setReady("invalid");
    }, 4000);
    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      // Typing the current password keeps it; treat that as done.
      if (/different from the old|same as the old|same_password/i.test(`${err.message} ${(err as { code?: string }).code || ""}`)) {
        setDone("unchanged");
        return;
      }
      setError("Couldn't save the new password. Please open the link from your email again.");
      return;
    }
    setDone("changed");
  };

  return (
    <main className="flex min-h-screen items-start justify-center bg-stone-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6">
        <p className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-900">
            ScholarTrack
          </Link>
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-stone-900">Choose a new password</h1>

        {ready === "checking" && (
          <p className="mt-6 flex items-center gap-2 text-sm text-stone-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking your link…
          </p>
        )}

        {ready === "invalid" && (
          <div className="mt-4 text-sm text-stone-700">
            <p>This link has expired or was already used. Reset links work once and for a limited time.</p>
            <Link href="/" className="mt-4 inline-block font-medium text-blue-800 hover:underline">
              Go to ScholarTrack and request a new link
            </Link>
          </div>
        )}

        {ready === "ok" && !done && (
          <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-700">New password</span>
              <PasswordInput
                autoFocus
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                inputClassName="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save new password
            </button>
          </form>
        )}

        {done && (
          <div className="mt-4 text-sm text-stone-700">
            <p>
              {done === "unchanged"
                ? "Your password is unchanged. You're signed in."
                : "Your password has been changed and you're signed in."}
            </p>
            <Link href="/" className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2.5 font-medium text-white hover:bg-stone-800">
              Continue to ScholarTrack
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
