export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getScholarshipById } from "@/lib/getScholarship";
import { ALUMNI_LIMITS, Alumnus, hostOf, isHttpUrl, programKey } from "@/lib/alumni";

/**
 * GET  /api/alumni?program=<key>
 *   Approved self-added alumni for a program, plus ids of listed alumni who asked
 *   to be removed. Only public fields are returned (never the contact email or note).
 *
 * POST /api/alumni
 *   { kind: "add", scholarshipId, name, university, detail?, profileUrl, evidenceUrl, note?, contact?, confirm: true, website? }
 *   { kind: "remove", scholarshipId, targetId, note, contact?, website? }
 *   Stored as pending for the admin to check. "website" is a honeypot.
 */

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
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function GET(req: NextRequest) {
  const program = (req.nextUrl.searchParams.get("program") || "").trim();
  if (!program || program.length > 120 || !/^[a-z0-9-]+$/.test(program)) {
    return NextResponse.json({ added: [], removed: [] });
  }
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ added: [], removed: [] });

  const { data, error } = await supabase
    .from("alumni_requests")
    .select("id, kind, target_id, name, university, detail, profile_url, evidence_url, created_at")
    .eq("program", program)
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) {
    // Table not created yet, or the database is unreachable: show the listed alumni only.
    return NextResponse.json({ added: [], removed: [] });
  }

  const added: Alumnus[] = [];
  const removed: string[] = [];
  for (const r of data || []) {
    if (r.kind === "remove" && r.target_id) removed.push(r.target_id);
    if (r.kind === "add" && r.name && r.university && r.evidence_url) {
      added.push({
        id: `self:${r.id}`,
        name: r.name,
        program,
        university: r.university,
        detail: r.detail || undefined,
        profileUrl: r.profile_url || undefined,
        evidenceUrl: r.evidence_url,
        evidenceLabel: hostOf(r.evidence_url),
        checked: String(r.created_at).slice(0, 10),
        source: "self",
      });
    }
  }
  return NextResponse.json(
    { added, removed },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Could not read the form.");
  }
  if (str(body.website)) return NextResponse.json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (throttled(ip)) return bad("Too many requests in a short time. Please try again later.", 429);

  const kind = body.kind === "add" || body.kind === "remove" ? body.kind : null;
  if (!kind) return bad("Unknown request.");

  const scholarshipId = str(body.scholarshipId);
  if (!scholarshipId || scholarshipId.length > 120) return bad("Unknown program.");
  const program = await getScholarshipById(scholarshipId);
  if (!program) return bad("Unknown program.");

  const note = str(body.note);
  const contact = str(body.contact);
  if (note.length > ALUMNI_LIMITS.note) return bad(`Please keep the note under ${ALUMNI_LIMITS.note} characters.`);
  if (contact.length > ALUMNI_LIMITS.contact) return bad("That email looks too long.");

  const row: Record<string, unknown> = {
    kind,
    program: programKey(scholarshipId),
    scholarship_id: scholarshipId,
    note: note || null,
    contact: contact || null,
  };

  if (kind === "remove") {
    const targetId = str(body.targetId);
    if (!targetId || targetId.length > 200) return bad("Please choose who should be removed.");
    if (!note) return bad("Please tell us briefly who you are, so we can act on it.");
    row.target_id = targetId;
  } else {
    const name = str(body.name);
    const university = str(body.university);
    const detail = str(body.detail);
    const profileUrl = str(body.profileUrl);
    const evidenceUrl = str(body.evidenceUrl);
    if (!name || name.length > ALUMNI_LIMITS.name) return bad("Please enter the name.");
    if (!university || university.length > ALUMNI_LIMITS.university) return bad("Please enter the university.");
    if (detail.length > ALUMNI_LIMITS.detail) return bad("Please shorten the degree and year.");
    if (!isHttpUrl(profileUrl) || profileUrl.length > ALUMNI_LIMITS.url) return bad("Please add a public profile link (LinkedIn, Facebook or a website).");
    if (!isHttpUrl(evidenceUrl) || evidenceUrl.length > ALUMNI_LIMITS.url) return bad("Please add a public page that shows the scholarship and university.");
    if (body.confirm !== true) return bad("Please confirm the person is Bangladeshi and agreed to be listed.");
    Object.assign(row, { name, university, detail: detail || null, profile_url: profileUrl, evidence_url: evidenceUrl });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return bad("This is not available right now.", 503);
  const { error } = await supabase.from("alumni_requests").insert(row);
  if (error) {
    console.warn("alumni_requests insert failed:", error.message);
    return bad("We couldn't save this just now. Please try again later.", 503);
  }
  return NextResponse.json({ ok: true });
}
