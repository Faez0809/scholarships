import { Scholarship } from "../types/scholarship";
import { calculateDaysRemaining } from "./scholarshipUtils";

/** Shared, server-safe helpers for describing a listing. */

export type ListingStatus = "open" | "soon" | "closed";

export function listingStatus(s: Scholarship): { status: ListingStatus; text: string; className: string } {
  const { days, isExpired, isClosingSoon, formattedDate } = calculateDaysRemaining(s.deadline);
  const expected = s.deadlineIsEstimate ? " (expected)" : "";
  if (isExpired) {
    return { status: "closed", text: "Closed for this round", className: "text-stone-500" };
  }
  if (isClosingSoon) {
    return {
      status: "soon",
      text: `Closes in ${days} day${days === 1 ? "" : "s"}${expected}`,
      className: "text-amber-800",
    };
  }
  return { status: "open", text: `Open · closes ${formattedDate}${expected}`, className: "text-emerald-800" };
}

export function coverageItems(s: {
  tuitionCovered: boolean;
  monthlyStipendUSD: number;
  relocationAirfareCovered: boolean;
  healthInsuranceCovered: boolean;
  housingProvided: boolean;
}): { label: string; covered: boolean }[] {
  return [
    { label: "Tuition", covered: s.tuitionCovered },
    { label: "Monthly stipend", covered: s.monthlyStipendUSD > 0 },
    { label: "Flights", covered: s.relocationAirfareCovered },
    { label: "Health insurance", covered: s.healthInsuranceCovered },
    { label: "Housing", covered: s.housingProvided },
  ];
}

/** Honest label: "Fully funded" only when tuition and a living stipend are both covered. */
export function fundingLevel(s: { tuitionCovered: boolean; monthlyStipendUSD: number }): "Fully funded" | "Partial funding" {
  return s.tuitionCovered && s.monthlyStipendUSD > 0 ? "Fully funded" : "Partial funding";
}
