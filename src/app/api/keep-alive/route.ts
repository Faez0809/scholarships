export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * GET /api/keep-alive
 * Called daily by a Vercel Cron Job (see vercel.json) so the Supabase project
 * sees regular activity and is not paused for inactivity.
 * If CRON_SECRET is set, only requests carrying it are accepted.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Database client is not configured." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("scholarships").select("id").limit(1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
}
