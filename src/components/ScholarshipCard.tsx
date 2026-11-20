"use client";

import React from "react";
import { Scholarship } from "../types/scholarship";
import { useScholarship } from "../context/ScholarshipContext";
import { useGuide } from "../context/GuideContext";
import { checkEligibility, formatSignedUSD, getSavingsRange } from "../utils/scholarshipUtils";
import { nationalityStatus } from "../data/nationality";
import { Bookmark, BookmarkCheck, Check, Minus, Pencil, Trash2 } from "lucide-react";
import { coverageItems, fundingLevel } from "./ui";
import { listingStatus } from "./BrowseParts";

/**
 * Four lines: name; country and level; status and money left; what's covered and fit.
 */
export const ScholarshipCard: React.FC<{ scholarship: Scholarship }> = ({ scholarship: s }) => {
  const { profile, isAdmin, setSelectedScholarship, setEditingScholarship, setIsAddModalOpen, deleteScholarship } =
    useScholarship();
  const { isSavedScholarship, toggleSavedScholarship } = useGuide();

  const eligibility = checkEligibility(s, profile);
  const { minSavings, maxSavings, isMultiUni } = getSavingsRange(s);
  const status = listingStatus(s);
  const saved = isSavedScholarship(s.id);
  const level = fundingLevel(s);
  const natStatus = nationalityStatus(s.id, profile.nationality);

  const money =
    isMultiUni && minSavings !== maxSavings
      ? `${formatSignedUSD(minSavings)} to ${formatSignedUSD(maxSavings)}`
      : formatSignedUSD(maxSavings);

  const fit = (() => {
    if (!profile.isSet) return null;
    if (eligibility.isEligible) {
      return natStatus === "check"
        ? { ok: true, text: "You qualify · check passport rules" }
        : { ok: true, text: "You qualify" };
    }
    if (!eligibility.nationalityPass) return { ok: false, text: "Not open to your passport" };
    if (!eligibility.agePass) return { ok: false, text: "Over the age limit" };
    if (!eligibility.degreePass) return { ok: false, text: `Only ${s.degrees.join(" and ")}` };
    if (!eligibility.cgpaPass) return { ok: false, text: `Needs CGPA ${s.minCGPA.toFixed(2)}` };
    if (!eligibility.ieltsPass) return { ok: false, text: `Needs IELTS ${s.minIELTS.toFixed(1)}` };
    return { ok: false, text: eligibility.reasons[0] || "Check requirements" };
  })();

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:shadow-sm has-[h3_button:focus-visible]:border-blue-700 has-[h3_button:focus-visible]:ring-2 has-[h3_button:focus-visible]:ring-blue-700/30">
      <div className="flex items-start justify-between gap-3">
        {/* 1. Name (the whole card opens through this button) */}
        <h3 className="font-serif text-lg font-semibold leading-snug text-stone-900">
          <button
            type="button"
            onClick={() => setSelectedScholarship(s)}
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {s.name}
          </button>
        </h3>
        <button
          type="button"
          onClick={() => toggleSavedScholarship(s.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${s.name} from your shortlist` : `Add ${s.name} to your shortlist`}
          className={`relative z-10 -mr-1.5 -mt-1 shrink-0 rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
            saved ? "text-blue-800" : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          }`}
        >
          {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      {/* 2. Country and level */}
      <p className="mt-1 text-sm text-stone-600">
        {s.country}
        <span className="text-stone-400" aria-hidden="true"> · </span>
        {s.degrees.join(" & ")}
        {level === "Partial funding" && (
          <>
            <span className="text-stone-400" aria-hidden="true"> · </span>
            <span className="text-amber-800">Partial funding</span>
          </>
        )}
      </p>

      {/* 3. Status and money left */}
      <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
        <span className={status.className}>{status.text}</span>
        <span className="tabular-nums text-stone-900">
          <span className={`font-semibold ${maxSavings >= 0 ? "" : "text-amber-800"}`}>{money}</span>
          <span className="text-stone-500">/mo left</span>
        </span>
      </p>

      {/* 4. What's covered, and whether you qualify */}
      <div className="mt-4 flex flex-1 flex-wrap items-end justify-between gap-x-3 gap-y-1.5 border-t border-stone-100 pt-3 text-xs">
        <ul className="flex flex-wrap gap-x-2.5 gap-y-1 text-stone-600" aria-label="What the funding covers">
          {coverageItems(s)
            .filter((c) => c.label !== "Housing")
            .map((c) => (
              <li
                key={c.label}
                className={`inline-flex items-center gap-0.5 ${c.covered ? "" : "text-stone-500 line-through decoration-stone-300"}`}
              >
                {c.covered ? <Check className="h-3 w-3 text-emerald-700" /> : <Minus className="h-3 w-3" />}
                {c.label === "Monthly stipend" ? "Stipend" : c.label === "Health insurance" ? "Insurance" : c.label}
                <span className="sr-only">{c.covered ? " covered" : " not covered"}</span>
              </li>
            ))}
        </ul>
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
              className="rounded-md p-1.5 text-red-700 hover:bg-red-50"
              aria-label={`Delete ${s.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : (
          fit && <span className={`font-medium ${fit.ok ? "text-emerald-800" : "text-amber-800"}`}>{fit.text}</span>
        )}
      </div>
    </article>
  );
};
