export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

/**
 * Admin only (x-admin-pin).
 * GET   /api/error-reports          open reports, newest first
 * PATCH /api/error-reports          { id, status: "fixed" | "dismissed" }
 */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  const { data, error } = await supabase
    .from("error_reports")
    .select("id, scholarship_id, field, message, contact, status, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    const missing = /relation .*error_reports.* does not exist|Could not find the table/i.test(error.message);
    return NextResponse.json(
      { error: missing ? "The error_reports table has not been created yet. Run the migration in Supabase." : error.message },
      { status: missing ? 409 : 500 }
    );
  }
  return NextResponse.json({ reports: data || [] });
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
  const status = body.status === "fixed" || body.status === "dismissed" ? body.status : null;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !status) return NextResponse.json({ error: "Invalid report or status." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  const { error } = await supabase.from("error_reports").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
