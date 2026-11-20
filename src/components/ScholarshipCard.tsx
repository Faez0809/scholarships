"use client";

import React from "react";
import { Scholarship } from "../types/scholarship";
import { useScholarship } from "../context/ScholarshipContext";
import { useGuide } from "../context/GuideContext";
import {
  calculateDaysRemaining,
  formatSignedUSD,
  checkEligibility,
  getSavingsRange,
} from "../utils/scholarshipUtils";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { FUNDING_LABELS } from "./ui";

export const ScholarshipCard: React.FC<{ scholarship: Scholarship }> = ({ scholarship: s }) => {
  const {
    profile,
    isAdmin,
    setSelectedScholarship,
    setEditingScholarship,
    setIsAddModalOpen,
    deleteScholarship,
    openSupervisorFinder,
  } = useScholarship();
  const { isSavedScholarship, toggleSavedScholarship } = useGuide();

  const eligibility = checkEligibility(s, profile);
  const { minSavings, maxSavings, isMultiUni } = getSavingsRange(s);
  const { days, isClosingSoon, isExpired, formattedDate } = calculateDaysRemaining(s.deadline);
  const saved = isSavedScholarship(s.id);

  const shortfall = (() => {
    if (eligibility.isEligible) return null;
    if (!eligibility.degreePass) return `Only for ${s.degrees.join(" and ")}`;
    if (!eligibility.cgpaPass && !eligibility.ieltsPass)
      return `Needs CGPA ${s.minCGPA.toFixed(2)} and IELTS ${s.minIELTS.toFixed(1)}`;
    if (!eligibility.cgpaPass) return `Needs CGPA ${s.minCGPA.toFixed(2)} (yours ${profile.cgpa.toFixed(2)})`;
    if (!eligibility.ieltsPass) return `Needs IELTS ${s.minIELTS.toFixed(1)} (yours ${profile.ielts.toFixed(1)})`;
    if (!eligibility.savingsPass) return `Leaves less than your $${profile.minSavingsDesired}/mo target`;
    return eligibility.reasons[0] || "Check the requirements";
  })();

  const savings =
    isMultiUni && minSavings !== maxSavings
      ? `${formatSignedUSD(minSavings)} to ${formatSignedUSD(maxSavings)}`
      : formatSignedUSD(maxSavings);

  const open = () => setSelectedScholarship(s);

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-sm has-[h3_button:focus-visible]:border-blue-600 has-[h3_button:focus-visible]:ring-2 has-[h3_button:focus-visible]:ring-blue-600/40">
      <div className="flex flex-1 flex-col p-5">
        {/* Type + save */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-stone-500">
            {FUNDING_LABELS[s.fundingType]}
            <span aria-hidden="true"> · </span>
            {s.degrees.join(" & ")}
          </p>
          <button
            type="button"
            onClick={() => toggleSavedScholarship(s.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${s.name} from saved` : `Save ${s.name}`}
            className={`relative z-10 -mr-1 -mt-1 rounded-md p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              saved ? "text-blue-800" : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            }`}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        {/* Title (the whole card opens via this button for keyboard users) */}
        <h3 className="mt-1.5 font-serif text-lg font-semibold leading-snug text-stone-900">
          <button
            type="button"
            onClick={open}
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
          >
            {s.name}
          </button>
        </h3>
        <p className="mt-1 truncate text-sm text-stone-600">
          {s.university}
          <span className="text-stone-400" aria-hidden="true"> · </span>
          {s.country}
        </p>

        {/* Fit */}
        <p
          className={`mt-4 flex items-start gap-1.5 text-[13px] font-medium ${
            eligibility.isEligible ? "text-emerald-700" : "text-amber-800"
          }`}
        >
          {eligibility.isEligible ? (
            <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          )}
          <span>{eligibility.isEligible ? "You meet the requirements" : shortfall}</span>
        </p>

        {/* Money */}
        <dl className="mt-auto grid grid-cols-2 gap-4 pt-4">
          <div>
            <dt className="text-xs text-stone-500">Stipend</dt>
            <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-stone-900">
              ${s.monthlyStipendUSD.toLocaleString("en-US")}
              <span className="ml-0.5 text-xs font-normal text-stone-500">/mo</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">Left each month</dt>
            <dd className={`mt-0.5 text-[15px] font-semibold tabular-nums ${maxSavings >= 0 ? "text-stone-900" : "text-amber-800"}`}>
              {savings}
              <span className="ml-0.5 text-xs font-normal text-stone-500">/mo</span>
            </dd>
          </div>
        </dl>

      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between gap-2 border-t border-stone-100 px-5 py-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs ${
            isExpired ? "text-stone-500" : isClosingSoon ? "font-medium text-amber-800" : "text-stone-600"
          }`}
        >
          {isClosingSoon ? <Clock className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
          {isExpired
            ? "Deadline passed"
            : isClosingSoon
            ? `Closes in ${days} day${days === 1 ? "" : "s"}`
            : `Closes ${formattedDate}`}
          {s.deadlineIsEstimate && !isExpired && <span className="text-stone-500">(expected)</span>}
        </span>

        {isAdmin ? (
          <span className="relative z-10 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setEditingScholarship(s);
                setIsAddModalOpen(true);
              }}
              className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              aria-label={`Edit ${s.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${s.name}"? This cannot be undone.`)) deleteScholarship(s.id);
              }}
              className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
              aria-label={`Delete ${s.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : s.fundingType === "Supervisor / RA-TA" ? (
          <button
            type="button"
            onClick={() => openSupervisorFinder(s.university, (s.fieldSpecifics || "").split(",")[0]?.trim() || "")}
            className="relative z-10 -my-1.5 -mr-1 rounded px-1 py-1.5 text-xs font-medium text-blue-800 hover:text-blue-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Find supervisors
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-800" aria-hidden="true">
            Details <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </article>
  );
};
