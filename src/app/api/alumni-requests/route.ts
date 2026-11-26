export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

/**
 * Admin only (x-admin-pin).
 * GET   /api/alumni-requests     pending add and remove requests, newest first
 * PATCH /api/alumni-requests     { id, status: "approved" | "rejected" }
 */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  const { data, error } = await supabase
    .from("alumni_requests")
    .select("id, kind, program, scholarship_id, target_id, name, university, detail, profile_url, evidence_url, note, contact, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    const missing = /relation .*alumni_requests.* does not exist|Could not find the table/i.test(error.message);
    return NextResponse.json(
      { error: missing ? "The alumni_requests table has not been created yet. Run the migration in Supabase." : error.message },
      { status: missing ? 409 : 500 }
    );
  }
  return NextResponse.json({ requests: data || [] });
}

export async function PATCH(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  let body: { id?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status === "approved" || body.status === "rejected" ? body.status : null;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !status) return NextResponse.json({ error: "Invalid request or status." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  const { error } = await supabase.from("alumni_requests").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
