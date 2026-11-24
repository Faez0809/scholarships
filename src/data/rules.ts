/**
 * Hidden rules that often disqualify applicants. Only rules confirmed from the
 * official guidelines (checked 2026-11-20) are listed; everything else shows no check.
 */

export interface AgeRule {
  /** Maximum age for Master's applicants (in the application year). */
  masters?: number;
  /** Maximum age for PhD applicants (in the application year). */
  phd?: number;
  note: string;
}

export const AGE_LIMITS: Record<string, AgeRule> = {
  "csc-china-high-level-2026": { masters: 35, phd: 40, note: "Under 35 for Master's and under 40 for PhD." },
  "turkiye-burslari-2027": { masters: 30, phd: 35, note: "Under 30 for Master's and under 35 for PhD." },
  "gks-graduate-korea-2027": { masters: 40, phd: 40, note: "Under 40 for graduate programs." },
  "swiss-government-excellence-2028": { phd: 35, note: "Applicants must be under 35 (born after 31 December 1991 for the 2027–28 call)." },
  "mext-japan-todai-2026": { masters: 35, phd: 35, note: "Under 35 on 1 April of the start year." },
  "brunei-government-2027": { masters: 35, note: "Master's applicants must be 35 or under on 1 July of the start year." },
};

/** IELTS and most English tests are accepted for two years from the test date. */
export const ENGLISH_TEST_VALID_YEARS = 2;

export function ageLimitFor(id: string, degree: "Master's" | "PhD" | "Both"): number | null {
  const rule = AGE_LIMITS[id];
  if (!rule) return null;
  if (degree === "Master's") return rule.masters ?? null;
  if (degree === "PhD") return rule.phd ?? null;
  const limits = [rule.masters, rule.phd].filter((n): n is number => typeof n === "number");
  return limits.length ? Math.max(...limits) : null;
}

/** Approximate age in the deadline's year. */
export function ageAtDeadline(birthYear: number | undefined, deadline: string): number | null {
  if (!birthYear || !/^\d{4}/.test(deadline)) return null;
  return Number(deadline.slice(0, 4)) - birthYear;
}

/** True when an English test taken on testDate (YYYY-MM) will be older than two years at the deadline. */
export function englishTestExpired(testDate: string | undefined, deadline: string): boolean {
  if (!testDate || !/^\d{4}-\d{2}/.test(testDate) || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return false;
  const [ty, tm] = testDate.split("-").map(Number);
  const expiry = new Date(ty + ENGLISH_TEST_VALID_YEARS, tm - 1, 1);
  const [dy, dm, dd] = deadline.split("-").map(Number);
  return expiry < new Date(dy, dm - 1, dd);
}
