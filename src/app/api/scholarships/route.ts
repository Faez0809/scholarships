import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SEED_SCHOLARSHIPS } from "@/data/seedScholarships";
import { Scholarship } from "@/types/scholarship";

const EXPECTED_PIN = process.env.ADMIN_PIN || "1234";

function verifyAdmin(req: NextRequest): boolean {
  const pin = req.headers.get("x-admin-pin");
  return pin === EXPECTED_PIN;
}

/**
 * GET /api/scholarships
 * Fetches all scholarships from Supabase.
 * - If 0 rows, auto-inserts all 12 global seed scholarships and returns them.
 * - If table doesn't exist yet or connection fails, falls back to SEED_SCHOLARSHIPS gracefully.
 */
export async function GET() {
  try {
    const { data: rows, error } = await supabase
      .from("scholarships")
      .select("id, data, updated_at")
      .order("updated_at", { ascending: false });

    // Fallback if table is not created yet or Supabase returns error
    if (error) {
      console.warn(
        "Supabase query error (falling back to local seed data):",
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
      console.log("Supabase scholarships table is empty. Auto-seeding 12 global scholarships...");
      const now = new Date().toISOString();
      const seedInserts = SEED_SCHOLARSHIPS.map((item) => ({
        id: item.id,
        data: item,
        updated_at: now,
      }));

      const { error: seedError } = await supabase
        .from("scholarships")
        .insert(seedInserts);

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
  } catch (err: any) {
    console.error("Unexpected error in GET /api/scholarships:", err);
    return NextResponse.json(
      {
        scholarships: SEED_SCHOLARSHIPS,
        source: "fallback_exception",
        error: err?.message,
      },
      { status: 200 }
    );
  }
}

/**
 * POST /api/scholarships
 * Creates or upserts a scholarship in Supabase.
 * Supports ?action=reset to reset table back to original 12 seed scholarships.
 * Protected by 'x-admin-pin' header.
 */
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing x-admin-pin header." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

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
        message: "Successfully reset to 12 global seed scholarships",
        scholarships: SEED_SCHOLARSHIPS,
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/**
 * PUT /api/scholarships
 * Updates an existing scholarship in Supabase.
 * Protected by 'x-admin-pin' header.
 */
export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing x-admin-pin header." },
      { status: 401 }
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/**
 * DELETE /api/scholarships
 * Deletes a scholarship from Supabase.
 * Accepts ?id=<id> or { id } in body.
 * Protected by 'x-admin-pin' header.
 */
export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing x-admin-pin header." },
      { status: 401 }
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
