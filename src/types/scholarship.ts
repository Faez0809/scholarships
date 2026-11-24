export type DegreeLevel = "Master's" | "PhD";

export type FieldCategory =
  | "All Fields"
  | "Computer Science & AI"
  | "Engineering"
  | "Life Sciences"
  | "Natural Sciences"
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
  /** Other fields the program also funds, e.g. an engineering school that also takes physics. */
  extraFields?: FieldCategory[];
  fieldSpecifics: string;
  /** 0 when the program publishes no fixed minimum. */
  minCGPA: number;
  /** 0 when the program publishes no fixed minimum. */
  minIELTS: number;
  /** Official wording of the grade and English requirements. */
  requirementsNote?: string;
  /** Date the minimums were checked against official pages. */
  requirementsChecked?: string;
  medium: MediumOfInstruction;
  deadline: string; // YYYY-MM-DD
  monthlyStipendUSD: number;
  /** True when the program pays a stipend but publishes no amount; monthlyStipendUSD is then 0. */
  stipendAmountUnknown?: boolean;
  /** The stipend as the program states it, e.g. "CHF 2,450 a month". */
  stipendDisplay?: string;
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
  /** True when the date is an expected date for the next cycle, not an announced one. */
  /** True when no date is published yet; deadline is then a far-future placeholder used only for sorting. */
  deadlineUnknown?: boolean;
  deadlineIsEstimate?: boolean;
  /** Short context for the deadline, e.g. "Varies by country" or "Previous round closed 15 Oct 2026". */
  deadlineNote?: string;
  /** True when the USD stipend is an approximation (unconfirmed rate or currency conversion). */
  stipendIsEstimate?: boolean;
  /** The stipend as officially published, in local currency. */
  stipendNote?: string;
  /** Date (YYYY-MM-DD) the figures were last checked against public sources. */
  lastVerified?: string;
  /** Bumped when curated money or deadline facts are corrected; Sync refreshes older rows. */
  dataVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  targetDegree: "Master's" | "PhD" | "Both";
  majorCategory: string; // "All" or FieldCategory
  /** What the student chose or typed for their subject, e.g. "Electrical & Electronic Engineering". */
  majorText?: string;
  cgpa: number;
  ielts: number;
  mediumPreference: MediumOfInstruction;
  minSavingsDesired: number;
  onlyEligible: boolean;
  selectedRegion: "All" | Region;
  fundingTypePreference: "All" | FundingType;
  supervisorPreference: "All" | "No Supervisor Needed" | "Supervisor Allowed";
  /** Passport country code (see data/nationality.ts); empty when not given. */
  nationality?: string;
  /** True once the visitor has answered the profile questions. */
  isSet?: boolean;
  /** Optional; used only for programs with a confirmed age limit. */
  birthYear?: number;
  /** Month of the English test, YYYY-MM; used to warn when it will be too old. */
  englishTestDate?: string;
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
  nationalityPass: boolean;
  agePass: boolean;
  reasons: string[];
}
