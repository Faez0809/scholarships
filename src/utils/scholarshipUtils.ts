import {
  EligibilityResult,
  PillFilter,
  Scholarship,
  SortOption,
  UserProfile,
} from "../types/scholarship";
import { nationalityLabel, nationalityStatus } from "../data/nationality";
import { ageAtDeadline, ageLimitFor } from "../data/rules";

export function calculateDaysRemaining(deadlineStr: string): {
  days: number;
  isClosingSoon: boolean;
  isExpired: boolean;
  formattedDate: string;
} {
  // Parse YYYY-MM-DD as a local calendar date so the day never shifts by time zone.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadlineStr?.trim() ?? "");
  const deadline = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(deadlineStr);
  const today = new Date();

  // Normalize both dates to midnight
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const formattedDate = deadline.toLocaleDateString("en-US", options);

  return {
    days,
    isClosingSoon: days > 0 && days <= 30,
    isExpired: days < 0,
    formattedDate,
  };
}

export function calculateNetSavings(scholarship: Scholarship): number {
  return scholarship.monthlyStipendUSD - scholarship.estimatedLivingCostUSD;
}

export function getSavingsRange(scholarship: Scholarship): {
  minSavings: number;
  maxSavings: number;
  isMultiUni: boolean;
} {
  if (
    scholarship.partnerUniversities &&
    scholarship.partnerUniversities.length > 0
  ) {
    const savings = scholarship.partnerUniversities.map(
      (u) => u.monthlyStipend - u.estimatedLivingCost
    );
    return {
      minSavings: Math.min(...savings),
      maxSavings: Math.max(...savings),
      isMultiUni: true,
    };
  }
  const single = calculateNetSavings(scholarship);
  return {
    minSavings: single,
    maxSavings: single,
    isMultiUni: false,
  };
}

export function checkEligibility(
  scholarship: Scholarship,
  profile: UserProfile
): EligibilityResult {
  const reasons: string[] = [];

  // Nationality check (only a confirmed "no" counts against you)
  const natStatus = nationalityStatus(scholarship.id, profile.nationality);
  const nationalityPass = natStatus !== "no";
  if (!nationalityPass) {
    reasons.push(`Not open to citizens of ${nationalityLabel(profile.nationality)}`);
  }

  // Age limit (only programs with a confirmed rule, only if a birth year is given)
  const limit = ageLimitFor(scholarship.id, profile.targetDegree);
  const age = ageAtDeadline(profile.birthYear, scholarship.deadline);
  const agePass = limit === null || age === null || age <= limit;
  if (!agePass) {
    reasons.push(`Age limit is ${limit} (you would be about ${age})`);
  }

  // Degree check
  let degreePass = true;
  if (profile.targetDegree !== "Both") {
    degreePass = scholarship.degrees.includes(profile.targetDegree);
    if (!degreePass) {
      reasons.push(
        `Requires ${scholarship.degrees.join(" or ")} (${profile.targetDegree} selected)`
      );
    }
  }

  // CGPA check
  const cgpaPass = profile.cgpa >= scholarship.minCGPA;
  if (!cgpaPass) {
    reasons.push(
      `Needs min CGPA ${scholarship.minCGPA.toFixed(2)} (Yours: ${profile.cgpa.toFixed(2)})`
    );
  }

  // IELTS check
  let ieltsPass = true;
  if (scholarship.minIELTS > 0) {
    ieltsPass = profile.ielts >= scholarship.minIELTS;
    if (!ieltsPass) {
      reasons.push(
        `Needs IELTS ${scholarship.minIELTS.toFixed(1)} (Yours: ${profile.ielts.toFixed(1)})`
      );
    }
  }

  // Medium of instruction check
  let mediumPass = true;
  if (profile.mediumPreference === "English Only") {
    mediumPass = scholarship.medium === "English Only";
    if (!mediumPass) {
      reasons.push("Not 100% English taught medium");
    }
  }

  // Field check
  let fieldPass = true;
  if (profile.majorCategory !== "All" && profile.majorCategory !== "All Fields") {
    fieldPass =
      scholarship.field === "All Fields" ||
      scholarship.field === profile.majorCategory;
    if (!fieldPass) {
      reasons.push(`Field focuses on ${scholarship.field}`);
    }
  }

  // Desired savings check (accounts for multi-uni maximum potential)
  // Money left is now a sort order, not a requirement, so it never blocks eligibility.
  const savingsPass = true;

  const isEligible =
    degreePass &&
    cgpaPass &&
    ieltsPass &&
    mediumPass &&
    fieldPass &&
    savingsPass &&
    nationalityPass &&
    agePass;

  return {
    isEligible,
    nationalityPass,
    agePass,
    degreePass,
    cgpaPass,
    ieltsPass,
    mediumPass,
    fieldPass,
    savingsPass,
    reasons,
  };
}

export function filterScholarships(
  scholarships: Scholarship[],
  profile: UserProfile,
  activePill: PillFilter,
  searchQuery: string,
  sortBy: SortOption
): Scholarship[] {
  let list = [...scholarships];

  // 1. World Region Filter
  if (profile.selectedRegion && profile.selectedRegion !== "All") {
    list = list.filter((s) => {
      if (s.region === "Global" || s.region === profile.selectedRegion) {
        return true;
      }
      return false;
    });
  }

  // 2. Funding Track Filter
  if (
    profile.fundingTypePreference &&
    profile.fundingTypePreference !== "All"
  ) {
    list = list.filter((s) => s.fundingType === profile.fundingTypePreference);
  }

  // 3. Supervisor Requirement Filter
  if (
    profile.supervisorPreference &&
    profile.supervisorPreference === "No Supervisor Needed"
  ) {
    list = list.filter(
      (s) => s.supervisorRequired === "Not Required (Central Admission)"
    );
  }

  // 4. Classification Pills
  if (activePill === "masters") {
    list = list.filter((s) => s.degrees.includes("Master's"));
  } else if (activePill === "phd") {
    list = list.filter((s) => s.degrees.includes("PhD"));
  } else if (activePill === "eligible") {
    list = list.filter((s) => checkEligibility(s, profile).isEligible);
  } else if (activePill === "high_savings") {
    list = list.filter((s) => getSavingsRange(s).maxSavings > 300);
  } else if (activePill === "closing_soon") {
    list = list.filter((s) => {
      const { isClosingSoon } = calculateDaysRemaining(s.deadline);
      return isClosingSoon;
    });
  }

  // 5. Profile "Only show 100% eligible" toggle
  if (profile.onlyEligible) {
    list = list.filter((s) => checkEligibility(s, profile).isEligible);
  }

  // 6. Search query (search title, university, country, partner unis, field)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.university.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.fundingType.toLowerCase().includes(q) ||
        s.field.toLowerCase().includes(q) ||
        (s.fieldSpecifics && s.fieldSpecifics.toLowerCase().includes(q)) ||
        (s.partnerUniversities &&
          s.partnerUniversities.some(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.city.toLowerCase().includes(q) ||
              p.country.toLowerCase().includes(q)
          ))
    );
  }

  // 7. Sorting
  list.sort((a, b) => {
    if (sortBy === "deadline") {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === "savings_high") {
      return getSavingsRange(b).maxSavings - getSavingsRange(a).maxSavings;
    }
    if (sortBy === "stipend_high") {
      return b.monthlyStipendUSD - a.monthlyStipendUSD;
    }
    if (sortBy === "cgpa_low") {
      return a.minCGPA - b.minCGPA;
    }
    if (sortBy === "name_asc") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return list;
}

/** Formats a monthly amount with an explicit sign, e.g. "+$420" or "-$168". */
export function formatSignedUSD(amount: number): string {
  const rounded = Math.round(amount);
  const abs = Math.abs(rounded).toLocaleString("en-US");
  return rounded >= 0 ? `+$${abs}` : `-$${abs}`;
}

/** Formats a YYYY-MM-DD date as e.g. "20 Nov 2026". */
export function formatVerifiedDate(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return dateStr;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
