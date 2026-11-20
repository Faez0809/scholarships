export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SUPABASE_URL, isValidHttpUrl } from "@/lib/supabase";

/**
 * POST /api/auth/signup
 * Creates an account that is confirmed straight away (no confirmation email),
 * so the browser can sign in immediately with the same email and password.
 */
export async function POST(req: NextRequest) {
  let email = "";
  let password = "";
  try {
    const body = await req.json();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Please enter an email and a password." }, { status: 400 });
  }

  if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
    return NextResponse.json({ error: "Please enter an email and a password." }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    return NextResponse.json({ error: "Sign-up is not available right now." }, { status: 503 });
  }
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const url = isValidHttpUrl(rawUrl) ? rawUrl! : DEFAULT_SUPABASE_URL;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("already") || m.includes("registered") || m.includes("exists")) {
      return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
    }
    if (m.includes("password")) {
      return NextResponse.json({ error: "That password is too short. Please use at least 6 characters." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not create the account. Please try again." }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
