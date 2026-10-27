export type DegreeLevel = "Master's" | "PhD";

export type FieldCategory =
  | "All Fields"
  | "Computer Science & AI"
  | "Engineering"
  | "Life Sciences"
  | "Business & Social Sciences";

export type MediumOfInstruction = "English Only" | "Any";

export type Region =
  | "Europe"
  | "Asia"
  | "Americas"
  | "Oceania"
  | "Middle East"
  | "Global";

export type FundingType =
  | "Gov / Multi-Uni"
  | "University Direct"
  | "Supervisor / RA-TA";

export type SupervisorRequirement =
  | "Mandatory Before Applying"
  | "Optional / Recommended"
  | "Not Required (Central Admission)";

export interface PartnerUniversity {
  name: string;
  city: string;
  country: string;
  flag: string;
  estimatedLivingCost: number;
  monthlyStipend: number;
  rankingOrNote: string;
  website?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  university: string;
  city: string;
  country: string;
  countryFlag: string;
  region: Region;
  fundingType: FundingType;
  supervisorRequired: SupervisorRequirement;
  partnerUniversities?: PartnerUniversity[];
  supervisorFundingGuide?: string;
  degrees: DegreeLevel[];
  field: FieldCategory;
  fieldSpecifics: string;
  minCGPA: number;
  minIELTS: number;
  medium: MediumOfInstruction;
  deadline: string; // YYYY-MM-DD
  monthlyStipendUSD: number;
  estimatedLivingCostUSD: number;
  tuitionCovered: boolean;
  healthInsuranceCovered: boolean;
  relocationAirfareCovered: boolean;
  housingProvided: boolean;
  facilities: string[];
  requiredDocuments: string[];
  overview: string;
  cityLifeOverview: string;
  officialWebsiteUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  targetDegree: "Master's" | "PhD" | "Both";
  majorCategory: string; // "All" or FieldCategory
  cgpa: number;
  ielts: number;
  mediumPreference: MediumOfInstruction;
  minSavingsDesired: number;
  onlyEligible: boolean;
  selectedRegion: "All" | Region;
  fundingTypePreference: "All" | FundingType;
  supervisorPreference: "All" | "No Supervisor Needed" | "Supervisor Allowed";
}

export type PillFilter =
  | "all"
  | "masters"
  | "phd"
  | "eligible"
  | "high_savings"
  | "closing_soon";

export type SortOption =
  | "deadline"
  | "savings_high"
  | "stipend_high"
  | "cgpa_low"
  | "name_asc";

export interface EligibilityResult {
  isEligible: boolean;
  cgpaPass: boolean;
  ieltsPass: boolean;
  degreePass: boolean;
  savingsPass: boolean;
  mediumPass: boolean;
  fieldPass: boolean;
  reasons: string[];
}
