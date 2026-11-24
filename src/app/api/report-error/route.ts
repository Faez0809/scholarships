export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getScholarshipById } from "@/lib/getScholarship";
import { REPORT_CONTACT_MAX, REPORT_FIELDS, REPORT_MESSAGE_MAX } from "@/lib/errorReports";

/**
 * POST /api/report-error
 * A visitor tells us a fact on a listing looks wrong. Stored for the admin to check.
 * Body: { scholarshipId, field, message, contact?, website? } where "website" is a
 * honeypot that people never see; bots that fill it get a silent success.
 */

// Simple per-IP throttle. Serverless instances do not share memory, so this only
// slows down bursts; the database constraints are the real limit on size.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Could not read the report.");
  }

  // Honeypot: pretend it worked.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (throttled(ip)) return bad("Too many reports in a short time. Please try again later.", 429);

  const scholarshipId = typeof body.scholarshipId === "string" ? body.scholarshipId.trim() : "";
  const field = typeof body.field === "string" ? body.field : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";

  if (!scholarshipId || scholarshipId.length > 120) return bad("Unknown program.");
  if (!(REPORT_FIELDS as readonly string[]).includes(field)) return bad("Please choose what is wrong.");
  if (!message) return bad("Please describe what is wrong.");
  if (message.length > REPORT_MESSAGE_MAX) return bad(`Please keep it under ${REPORT_MESSAGE_MAX} characters.`);
  if (contact.length > REPORT_CONTACT_MAX) return bad("That email looks too long.");

  const program = await getScholarshipById(scholarshipId);
  if (!program) return bad("Unknown program.");

  const supabase = getSupabaseAdminClient();
  if (!supabase) return bad("Reports are not available right now.", 503);

  const { error } = await supabase.from("error_reports").insert({
    scholarship_id: scholarshipId,
    field,
    message,
    contact: contact || null,
  });
  if (error) {
    console.warn("error_reports insert failed:", error.message);
    return bad("We couldn't save your report just now. Please try again later.", 503);
  }
  return NextResponse.json({ ok: true });
}
