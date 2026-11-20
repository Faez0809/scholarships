"use client";

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserSupabase } from "../lib/supabaseBrowser";
import { useScholarship } from "./ScholarshipContext";
import { OutreachContact, SenderDetails, useOutreach } from "./OutreachContext";
import { GuideState, useGuide } from "./GuideContext";
import { UserProfile } from "../types/scholarship";

/**
 * Optional accounts. Guests keep everything in this browser (localStorage).
 * Signed-in users get the same data saved to their own row in `user_state`,
 * protected by Row-Level Security (auth.uid() = user_id).
 *
 * On first sign-in the data in this browser is copied into the account.
 * If the account already has data, the account copy wins.
 * If the table does not exist yet, the app keeps working locally.
 */

export type CloudStatus = "guest" | "loading" | "saved" | "saving" | "error" | "unavailable";

interface AccountContextType {
  session: Session | null;
  email: string | null;
  status: CloudStatus;
  isAuthAvailable: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  sendMagicLink: (email: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
}

interface UserStateRow {
  user_id: string;
  profile: UserProfile | null;
  document_checklist: Record<string, boolean> | null;
  saved_scholarships: string[] | null;
  outreach_contacts: OutreachContact[] | null;
  outreach_sender: SenderDetails | null;
  guide: Partial<GuideState> | null;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

function friendly(message: string | undefined): string {
  const m = (message || "").toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Try again or use an email link.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (m.includes("already registered")) return "An account with this email already exists. Sign in instead.";
  if (m.includes("password")) return "Use a password with at least 6 characters.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("provider is not enabled")) return "Google sign-in isn't switched on yet. Use email instead.";
  return message || "Something went wrong. Please try again.";
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const supabase = typeof window !== "undefined" ? getBrowserSupabase() : null;
  const { profile, setProfile, documentChecklist, replaceDocumentChecklist } = useScholarship();
  const { contacts, sender, replaceAll, isLoaded: outreachLoaded } = useOutreach();
  const { savedIds, guideState, replaceGuide } = useGuide();

  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<CloudStatus>("guest");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const readyForSync = useRef(false);
  const lastSaved = useRef<string>("");

  // Track the auth session
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const snapshot = useCallback(
    () => ({
      profile,
      document_checklist: documentChecklist,
      saved_scholarships: savedIds,
      outreach_contacts: contacts,
      outreach_sender: sender,
      guide: guideState,
    }),
    [profile, documentChecklist, savedIds, contacts, sender, guideState]
  );

  // On sign-in: load the account copy, or import this browser's data into a new account row.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    readyForSync.current = false;
    if (!supabase || !userId || !outreachLoaded) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("loading");
      const { data, error } = await supabase
        .from("user_state")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle<UserStateRow>();
      if (cancelled) return;
      if (error) {
        console.warn("Account storage unavailable:", error.message);
        setStatus("unavailable");
        return;
      }
      if (data) {
        if (data.profile) setProfile((p) => ({ ...p, ...data.profile }));
        if (data.document_checklist) replaceDocumentChecklist(data.document_checklist);
        replaceAll(data.outreach_contacts || [], data.outreach_sender || { fullName: "", currentRole: "", researchInterest: "", highlights: "" });
        replaceGuide(data.saved_scholarships || [], data.guide || {});
        lastSaved.current = "";
        setStatus("saved");
      } else {
        const payload = { user_id: userId, ...snapshot(), updated_at: new Date().toISOString() };
        const { error: insertErr } = await supabase.from("user_state").insert(payload);
        if (cancelled) return;
        setStatus(insertErr ? "error" : "saved");
      }
      readyForSync.current = true;
    })();
    return () => {
      cancelled = true;
    };
    // Runs once per sign-in; snapshot is read at that moment on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, userId, outreachLoaded]);

  // Save changes to the account (debounced)
  useEffect(() => {
    if (!supabase || !userId || !readyForSync.current) return;
    const data = snapshot();
    const serialized = JSON.stringify(data);
    if (serialized === lastSaved.current) return;
    const timer = window.setTimeout(async () => {
      setStatus("saving");
      const { error } = await supabase
        .from("user_state")
        .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() });
      if (error) {
        setStatus("error");
      } else {
        lastSaved.current = serialized;
        setStatus("saved");
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [supabase, userId, snapshot]);

  const value: AccountContextType = {
    session,
    email: session?.user?.email ?? null,
    status: userId ? status : "guest",
    isAuthAvailable: !!supabase,
    isAuthOpen,
    setIsAuthOpen,
    signInWithPassword: async (email, password) => {
      if (!supabase) return "Sign-in is not available right now.";
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? friendly(error.message) : null;
    },
    signUp: async (email, password) => {
      if (!supabase) return { error: "Sign-in is not available right now.", needsConfirmation: false };
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) return { error: friendly(error.message), needsConfirmation: false };
      return { error: null, needsConfirmation: !data.session };
    },
    sendMagicLink: async (email) => {
      if (!supabase) return "Sign-in is not available right now.";
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      return error ? friendly(error.message) : null;
    },
    signInWithGoogle: async () => {
      if (!supabase) return "Sign-in is not available right now.";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      return error ? friendly(error.message) : null;
    },
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      setStatus("guest");
    },
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextType {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
