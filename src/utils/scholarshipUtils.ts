import {
  EligibilityResult,
  PillFilter,
  Region,
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
  const { maxSavings } = getSavingsRange(scholarship);
  const savingsPass = maxSavings >= profile.minSavingsDesired;
  if (!savingsPass) {
    reasons.push(
      `Net savings ($${maxSavings}/mo) below your target of $${profile.minSavingsDesired}/mo`
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
      return a.university.localeCompare(b.university);
    }
    return 0;
  });

  return list;
}
