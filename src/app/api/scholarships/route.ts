export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
import { getSupabaseClient } from "@/lib/supabase";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { SEED_SCHOLARSHIPS } from "@/data/seedScholarships";
import { Scholarship } from "@/types/scholarship";

/**
 * GET /api/scholarships
 * Fetches all scholarships from Supabase.
 * - If 0 rows, auto-inserts all built-in seed scholarships and returns them.
 * - If client cannot be initialized or table doesn't exist yet, falls back to SEED_SCHOLARSHIPS gracefully.
 */
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        {
          scholarships: SEED_SCHOLARSHIPS,
          source: "fallback",
          warning: "Supabase client not configured; operating in local mode.",
        },
        { status: 200 }
      );
    }

    const { data: rows, error } = await supabase
      .from("scholarships")
      .select("id, data, updated_at")
      .order("updated_at", { ascending: false });

    // Fallback if table is not created yet or Supabase returns error
    if (error) {
      console.warn(
        "Supabase query warning (falling back to local seed data):",
        error.message
      );
      return NextResponse.json(
        {
          scholarships: SEED_SCHOLARSHIPS,
          source: "fallback",
          warning: error.message,
        },
        { status: 200 }
      );
    }

    // Auto-seed if the database table is completely empty
    if (!rows || rows.length === 0) {
      console.log("Supabase scholarships table is empty. Auto-seeding built-in scholarships...");
      const now = new Date().toISOString();
      const seedInserts = SEED_SCHOLARSHIPS.map((item) => ({
        id: item.id,
        data: item,
        updated_at: now,
      }));

      const writer = getSupabaseAdminClient();
      const { error: seedError } = writer
        ? await writer.from("scholarships").insert(seedInserts)
        : { error: { message: "Database writer is not configured." } };

      if (seedError) {
        console.error("Auto-seeding error:", seedError.message);
        return NextResponse.json(
          {
            scholarships: SEED_SCHOLARSHIPS,
            source: "fallback_seed_error",
            warning: seedError.message,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          scholarships: SEED_SCHOLARSHIPS,
          source: "supabase_seeded",
          count: SEED_SCHOLARSHIPS.length,
        },
        { status: 200 }
      );
    }

    // Return records stored in Supabase JSONB data column
    const scholarships: Scholarship[] = rows.map((r) => r.data as Scholarship);

    return NextResponse.json(
      {
        scholarships,
        source: "supabase",
        count: scholarships.length,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in GET /api/scholarships:", err);
    return NextResponse.json(
      {
        scholarships: SEED_SCHOLARSHIPS,
        source: "fallback_exception",
        error: errorMessage(err),
      },
      { status: 200 }
    );
  }
}

/**
 * POST /api/scholarships
 * Creates or upserts a scholarship in Supabase.
 * Supports ?action=reset to replace the table with the built-in seed scholarships,
 * ?action=sync to add missing built-in programs and refresh their dated deadline facts (keeps custom entries),
 * and ?action=verify to confirm an admin passcode without writing anything.
 * Protected by the 'x-admin-pin' header (checked against ADMIN_PIN on the server).
 */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  if (new URL(req.url).searchParams.get("action") === "verify") {
    return NextResponse.json({ success: true });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase database client is not configured." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // Add built-in programs that are missing and refresh dated deadline facts,
  // without deleting or overwriting anything an admin has entered.
  if (action === "sync") {
    try {
      const { data: existingRows, error: readErr } = await supabase
        .from("scholarships")
        .select("id, data");
      if (readErr) {
        return NextResponse.json({ error: readErr.message }, { status: 500 });
      }

      const existing = new Map(
        (existingRows || []).map((r) => [r.id as string, (r.data || {}) as Partial<Scholarship>])
      );
      const now = new Date().toISOString();

      // 1. Programs that are not in the database yet
      const missing = SEED_SCHOLARSHIPS.filter((item) => !existing.has(item.id));

      // 2. Built-in programs whose stored deadline facts are older than the curated ones.
      //    Only the deadline/stipend note fields are refreshed; other edits are kept.
      const refreshed = SEED_SCHOLARSHIPS.filter((item) => {
        const stored = existing.get(item.id);
        if (!stored || !item.lastVerified) return false;
        return !stored.lastVerified || stored.lastVerified < item.lastVerified;
      }).map((item) => {
        const stored = existing.get(item.id)!;
        const merged: Partial<Scholarship> = {
          ...stored,
          deadline: item.deadline,
          deadlineIsEstimate: item.deadlineIsEstimate,
          deadlineNote: item.deadlineNote,
          stipendIsEstimate: item.stipendIsEstimate,
          stipendNote: item.stipendNote,
          lastVerified: item.lastVerified,
          updatedAt: now,
        };
        return { id: item.id, data: merged, updated_at: now };
      });

      const writes = [
        ...missing.map((item) => ({
          id: item.id,
          data: { ...item, createdAt: now, updatedAt: now },
          updated_at: now,
        })),
        ...refreshed,
      ];

      if (writes.length > 0) {
        const { error: writeErr } = await supabase.from("scholarships").upsert(writes);
        if (writeErr) {
          return NextResponse.json({ error: writeErr.message }, { status: 500 });
        }
      }

      return NextResponse.json({
        success: true,
        added: missing.length,
        updated: refreshed.length,
        addedIds: missing.map((m) => m.id),
      });
    } catch (err: unknown) {
      return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
    }
  }

  // Reset database back to default seed scholarships
  if (action === "reset") {
    try {
      // Delete existing records
      await supabase.from("scholarships").delete().neq("id", "___dummy___");

      // Re-insert seed scholarships
      const now = new Date().toISOString();
      const seedInserts = SEED_SCHOLARSHIPS.map((item) => ({
        id: item.id,
        data: item,
        updated_at: now,
      }));

      const { error: insertErr } = await supabase
        .from("scholarships")
        .insert(seedInserts);

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Reset to ${SEED_SCHOLARSHIPS.length} built-in scholarships`,
        scholarships: SEED_SCHOLARSHIPS,
      });
    } catch (err: unknown) {
      return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
    }
  }

  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const id = body.id || `scholarship-${Date.now()}`;

    const scholarshipRecord: Scholarship = {
      ...body,
      id,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    const { error } = await supabase.from("scholarships").upsert({
      id,
      data: scholarshipRecord,
      updated_at: now,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, scholarship: scholarshipRecord },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 });
  }
}

/**
 * PUT /api/scholarships
 * Updates an existing scholarship in Supabase.
 * Protected by the 'x-admin-pin' header (checked against ADMIN_PIN on the server).
 */
export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase database client is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { error: "Scholarship ID is required for update." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Fetch existing record to ensure clean merge
    const { data: existingRow } = await supabase
      .from("scholarships")
      .select("data")
      .eq("id", id)
      .maybeSingle();

    const mergedScholarship: Scholarship = {
      ...(existingRow?.data || {}),
      ...body,
      updatedAt: now,
    };

    const { error } = await supabase.from("scholarships").upsert({
      id,
      data: mergedScholarship,
      updated_at: now,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      scholarship: mergedScholarship,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 });
  }
}

/**
 * DELETE /api/scholarships
 * Deletes a scholarship from Supabase.
 * Accepts ?id=<id> or { id } in body.
 * Protected by the 'x-admin-pin' header (checked against ADMIN_PIN on the server).
 */
export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase database client is not configured." },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // No body
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Scholarship ID is required for deletion." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("scholarships")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
