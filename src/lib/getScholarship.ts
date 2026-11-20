import { getSupabaseClient } from "./supabase";
import { SEED_SCHOLARSHIPS } from "../data/seedScholarships";
import { Scholarship } from "../types/scholarship";

/** Server-side lookup for one scholarship: live database first, bundled catalog as fallback. */
export async function getScholarshipById(id: string): Promise<Scholarship | null> {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from("scholarships").select("data").eq("id", id).maybeSingle();
      if (!error && data?.data) return data.data as Scholarship;
    }
  } catch {
    // Fall back to the bundled catalog below.
  }
  return SEED_SCHOLARSHIPS.find((s) => s.id === id) || null;
}
