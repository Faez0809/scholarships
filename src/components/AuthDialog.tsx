"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Mail, Loader2, CheckCircle2, LogOut, Cloud, CloudOff, UserRound } from "lucide-react";
import { useAccount } from "../context/AccountContext";
import { btn } from "./ui";

type Mode = "signin" | "signup" | "link";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SIGNIN === "true";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

/** Header button: "Sign in" for guests, account menu when signed in. */
export const AccountButton: React.FC = () => {
  const { session, email, status, setIsAuthOpen, signOut } = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!session) {
    return (
      <button type="button" onClick={() => setIsAuthOpen(true)} className={`${btn.secondary} px-3 py-1.5 text-xs`}>
        Sign in
      </button>
    );
  }

  const statusText =
    status === "saving"
      ? "Saving…"
      : status === "saved"
      ? "All changes saved to your account"
      : status === "loading"
      ? "Loading your data…"
      : status === "unavailable"
      ? "Account storage isn't set up yet. Your data is saved in this browser."
      : status === "error"
      ? "Couldn't save just now. We'll retry on your next change."
      : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold uppercase text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        {(email || "?").slice(0, 1)}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-1.5 w-64 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-zinc-900">{email}</p>
            <p className="mt-1 flex items-start gap-1.5 text-xs text-zinc-500">
              {status === "unavailable" || status === "error" ? (
                <CloudOff className="mt-px h-3.5 w-3.5 shrink-0 text-amber-600" />
              ) : (
                <Cloud className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" />
              )}
              {statusText}
            </p>
          </div>
          <div className="my-1 border-t border-zinc-100" />
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
          >
            <LogOut className="h-4 w-4 text-zinc-500" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

/** Sign-in / create account dialog. */
export const AuthDialog: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, session, signInWithPassword, signUp, sendMagicLink, signInWithGoogle } = useAccount();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Close once signed in
  if (isAuthOpen && session) setIsAuthOpen(false);

  useEffect(() => {
    if (!isAuthOpen) return;
    const t = window.setTimeout(() => emailRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsAuthOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [isAuthOpen, setIsAuthOpen]);

  if (!isAuthOpen) return null;

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode !== "link" && password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }
    setBusy(true);
    if (mode === "signin") {
      const err = await signInWithPassword(email, password);
      if (err) setError(err);
    } else if (mode === "signup") {
      const r = await signUp(email, password);
      if (r.error) setError(r.error);
      else if (r.needsConfirmation) setInfo("Check your inbox and click the link to confirm your account. Then you're signed in.");
    } else {
      const err = await sendMagicLink(email);
      if (err) setError(err);
      else setInfo("We sent a sign-in link to your email. Open it on this device.");
    }
    setBusy(false);
  };

  const title = mode === "signup" ? "Create your account" : mode === "link" ? "Get a sign-in link" : "Sign in";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="absolute inset-0 bg-black/40" onClick={() => setIsAuthOpen(false)} />
      <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <h2 id="auth-title" className="text-base font-semibold text-zinc-900">
                {title}
              </h2>
              <p className="text-xs text-zinc-500">Keep your profile, shortlist and outreach on every device.</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsAuthOpen(false)} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {info ? (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {info}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-700">Email</span>
              <input ref={emailRef} type="email" autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            {mode !== "link" && (
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-700">Password</span>
                <input
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                />
              </label>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className={`${btn.primary} w-full`}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create account" : mode === "link" ? "Email me a link" : "Sign in"}
            </button>
          </form>
        )}

        {!info && (
          <>
            {GOOGLE_ENABLED && (
              <>
                <div className="my-4 flex items-center gap-3 text-xs text-zinc-400">
                  <span className="h-px flex-1 bg-zinc-200" /> or <span className="h-px flex-1 bg-zinc-200" />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const err = await signInWithGoogle();
                    if (err) setError(err);
                  }}
                  className={`${btn.secondary} w-full`}
                >
                  Continue with Google
                </button>
              </>
            )}
            <div className="mt-4 space-y-1.5 text-center text-xs text-zinc-600">
              {mode !== "link" && (
                <p>
                  <button type="button" onClick={() => switchMode("link")} className="inline-flex items-center gap-1 font-medium text-indigo-700 hover:underline">
                    <Mail className="h-3.5 w-3.5" /> Sign in with an email link instead
                  </button>
                </p>
              )}
              {mode === "signup" ? (
                <p>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("signin")} className="font-medium text-indigo-700 hover:underline">
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  New here?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="font-medium text-indigo-700 hover:underline">
                    Create an account
                  </button>
                </p>
              )}
            </div>
          </>
        )}
        <p className="mt-4 text-center text-[11px] text-zinc-400">
          Browsing works without an account. Signing in copies what you&apos;ve saved in this browser to your account.
        </p>
      </div>
    </div>
  );
};

/** Gentle prompt for guests once they have something worth keeping. */
export const SaveProgressPrompt: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { session, setIsAuthOpen } = useAccount();
  const [hidden, setHidden] = useState(false);
  if (session || !visible || hidden) return null;
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-900">Save your progress</p>
        <p className="text-xs text-zinc-600">Create a free account to keep your profile, shortlist and outreach on any device.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={() => setHidden(true)} className={`${btn.ghost} text-xs`}>
          Not now
        </button>
        <button type="button" onClick={() => setIsAuthOpen(true)} className={`${btn.primary} px-3 py-1.5 text-xs`}>
          Create account
        </button>
      </div>
    </div>
  );
};
