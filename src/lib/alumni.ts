/**
 * Bangladeshi alumni and current scholars of a program, listed so applicants can
 * reach out. Shared by the public section, the API routes and the admin list.
 *
 * Listing rule: a person appears only when public evidence shows all three:
 * they are or were at that university, they are Bangladeshi, and they hold or
 * held this scholarship. We link out to their own public profile instead of
 * copying personal details.
 */

export interface Alumnus {
  /** Stable id, e.g. "gates-cambridge:jane-doe". Used for removal requests. */
  id: string;
  name: string;
  /** Program key: the scholarship id without its year, e.g. "gates-cambridge". */
  program: string;
  university: string;
  /** As the source states it, e.g. "PhD in Engineering, 2021 cohort". */
  detail?: string;
  /** A public profile the person published themselves (LinkedIn, Facebook, website). */
  profileUrl?: string;
  /** Page that shows they are Bangladeshi, at this university, and hold the scholarship. */
  evidenceUrl: string;
  /** Short name of the evidence page, e.g. "Gates Cambridge scholar profile". */
  evidenceLabel: string;
  /** Second source when one page does not show all three facts. */
  extraEvidenceUrl?: string;
  extraEvidenceLabel?: string;
  /** YYYY-MM-DD the sources were read. */
  checked: string;
  /** "listed" for entries we found; "self" for alumni who added themselves. */
  source: "listed" | "self";
}

/** Scholarship ids carry the intake year ("chevening-uk-2028"); alumni belong to the program across years. */
export function programKey(scholarshipId: string): string {
  return scholarshipId.replace(/-(19|20)\d{2}$/, "");
}

export const ALUMNI_KINDS = ["add", "remove"] as const;
export type AlumniRequestKind = (typeof ALUMNI_KINDS)[number];
export type AlumniRequestStatus = "pending" | "approved" | "rejected";

export const ALUMNI_LIMITS = {
  name: 120,
  university: 160,
  detail: 160,
  url: 500,
  note: 1000,
  contact: 200,
} as const;

export interface AlumniRequest {
  id: string;
  kind: AlumniRequestKind;
  program: string;
  scholarship_id: string;
  target_id: string | null;
  name: string | null;
  university: string | null;
  detail: string | null;
  profile_url: string | null;
  evidence_url: string | null;
  note: string | null;
  contact: string | null;
  status: AlumniRequestStatus;
  created_at: string;
}

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Label for a profile link, from its host. */
export function profileLabel(url: string): string {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Profile";
  }
  if (/linkedin\.com$/.test(host)) return "LinkedIn";
  if (/facebook\.com$|fb\.com$/.test(host)) return "Facebook";
  if (/(^|\.)x\.com$|twitter\.com$/.test(host)) return "X";
  if (/github\.com$/.test(host)) return "GitHub";
  if (/scholar\.google\./.test(host)) return "Google Scholar";
  if (/researchgate\.net$/.test(host)) return "ResearchGate";
  return "Website";
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
