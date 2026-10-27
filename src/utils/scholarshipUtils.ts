import {
  EligibilityResult,
  PillFilter,
  Scholarship,
  SortOption,
  UserProfile,
} from "../types/scholarship";

export function calculateDaysRemaining(deadlineStr: string): {
  days: number;
  isClosingSoon: boolean;
  isExpired: boolean;
  formattedDate: string;
} {
  const deadline = new Date(deadlineStr);
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

export function checkEligibility(
  scholarship: Scholarship,
  profile: UserProfile
): EligibilityResult {
  const reasons: string[] = [];

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

  // Desired savings check
  const netSavings = calculateNetSavings(scholarship);
  const savingsPass = netSavings >= profile.minSavingsDesired;
  if (!savingsPass) {
    reasons.push(
      `Net savings ($${netSavings}/mo) below your target of $${profile.minSavingsDesired}/mo`
    );
  }

  const isEligible =
    degreePass &&
    cgpaPass &&
    ieltsPass &&
    mediumPass &&
    fieldPass &&
    savingsPass;

  return {
    isEligible,
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

  // 1. Classification Pills
  if (activePill === "masters") {
    list = list.filter((s) => s.degrees.includes("Master's"));
  } else if (activePill === "phd") {
    list = list.filter((s) => s.degrees.includes("PhD"));
  } else if (activePill === "eligible") {
    list = list.filter((s) => checkEligibility(s, profile).isEligible);
  } else if (activePill === "high_savings") {
    list = list.filter((s) => calculateNetSavings(s) > 300);
  } else if (activePill === "closing_soon") {
    list = list.filter((s) => {
      const { isClosingSoon } = calculateDaysRemaining(s.deadline);
      return isClosingSoon;
    });
  }

  // 2. Profile "Only show 100% eligible" toggle
  if (profile.onlyEligible) {
    list = list.filter((s) => checkEligibility(s, profile).isEligible);
  }

  // 3. Search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.university.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.field.toLowerCase().includes(q) ||
        (s.fieldSpecifics && s.fieldSpecifics.toLowerCase().includes(q))
    );
  }

  // 4. Sorting
  list.sort((a, b) => {
    if (sortBy === "deadline") {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === "savings_high") {
      return calculateNetSavings(b) - calculateNetSavings(a);
    }
    if (sortBy === "stipend_high") {
      return b.monthlyStipendUSD - a.monthlyStipendUSD;
    }
    if (sortBy === "cgpa_low") {
      return a.minCGPA - b.minCGPA;
    }
    if (sortBy === "name_asc") {
      return a.university.localeCompare(b.university);
    }
    return 0;
  });

  return list;
}
