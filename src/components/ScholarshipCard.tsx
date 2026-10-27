"use client";

import React from "react";
import { Scholarship } from "../types/scholarship";
import { useScholarship } from "../context/ScholarshipContext";
import {
  calculateDaysRemaining,
  calculateNetSavings,
  checkEligibility,
  getSavingsRange,
} from "../utils/scholarshipUtils";
import {
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Landmark,
  Microscope,
  GraduationCap,
  Users,
} from "lucide-react";

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
}) => {
  const {
    profile,
    isAdmin,
    setSelectedScholarship,
    setEditingScholarship,
    setIsAddModalOpen,
    deleteScholarship,
  } = useScholarship();

  const eligibility = checkEligibility(scholarship, profile);
  const { minSavings, maxSavings, isMultiUni } = getSavingsRange(scholarship);
  const { days, isClosingSoon, isExpired, formattedDate } =
    calculateDaysRemaining(scholarship.deadline);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingScholarship(scholarship);
    setIsAddModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete "${scholarship.name}"? This cannot be undone.`
      )
    ) {
      deleteScholarship(scholarship.id);
    }
  };

  // Eligibility badge rendering
  const renderEligibilityBadge = () => {
    if (eligibility.isEligible) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          <span>Eligible ✅</span>
        </span>
      );
    }

    // Specific reasons for badging
    let label = "Needs Requirements ⚠️";
    if (!eligibility.cgpaPass && !eligibility.ieltsPass) {
      label = `Needs CGPA ${scholarship.minCGPA.toFixed(2)} & IELTS ${scholarship.minIELTS.toFixed(1)} ⚠️`;
    } else if (!eligibility.cgpaPass) {
      label = `Needs CGPA ${scholarship.minCGPA.toFixed(2)} ⚠️`;
    } else if (!eligibility.ieltsPass) {
      label = `Needs IELTS ${scholarship.minIELTS.toFixed(1)} ⚠️`;
    } else if (!eligibility.degreePass) {
      label = `Requires ${scholarship.degrees.join("/")} ⚠️`;
    } else if (!eligibility.savingsPass) {
      label = `Savings < $${profile.minSavingsDesired}/mo ⚠️`;
    }

    return (
      <span
        title={eligibility.reasons.join(" • ")}
        className="inline-flex items-center gap-1 rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800"
      >
        <AlertTriangle className="h-3 w-3 text-amber-600" />
        <span className="truncate max-w-[210px]">{label}</span>
      </span>
    );
  };

  // Funding Track Pill
  const renderFundingBadge = () => {
    if (scholarship.fundingType === "Gov / Multi-Uni") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200/60">
          <Landmark className="h-2.5 w-2.5" />
          <span>Gov / Umbrella</span>
        </span>
      );
    }
    if (scholarship.fundingType === "Supervisor / RA-TA") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">
          <Microscope className="h-2.5 w-2.5" />
          <span>Supervisor RA/TA</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 border border-zinc-200/60">
        <GraduationCap className="h-2.5 w-2.5" />
        <span>Uni Fellowship</span>
      </span>
    );
  };

  // Supervisor Requirement Pill
  const renderSupervisorBadge = () => {
    if (scholarship.supervisorRequired === "Mandatory Before Applying") {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200/60">
          👨‍🏫 Supervisor Req.
        </span>
      );
    }
    if (scholarship.supervisorRequired === "Not Required (Central Admission)") {
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200/60">
          ✅ Direct Apply
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
        🤝 Supervisor Rec.
      </span>
    );
  };

  return (
    <div
      onClick={() => setSelectedScholarship(scholarship)}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Top Header: Location, Region, Degrees, Field Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
            <span className="text-base leading-none">{scholarship.countryFlag || "🌍"}</span>
            <span>
              {scholarship.city}, {scholarship.country}
            </span>
            <span className="rounded-sm bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-500 font-medium">
              {scholarship.region}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {scholarship.degrees.map((deg) => (
              <span
                key={deg}
                className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700"
              >
                {deg}
              </span>
            ))}
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
              {scholarship.field}
            </span>
          </div>
        </div>

        {/* Funding Model & Supervisor Pills Row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {renderFundingBadge()}
          {renderSupervisorBadge()}
          {isMultiUni && scholarship.partnerUniversities && (
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-800 border border-indigo-200/60">
              <Users className="h-2.5 w-2.5" />
              <span>{scholarship.partnerUniversities.length} Partner Unis</span>
            </span>
          )}
        </div>

        {/* Scholarship Name & University */}
        <div className="mt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {scholarship.name}
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{scholarship.university}</span>
          </div>
        </div>

        {/* Dynamic Eligibility Match Badge */}
        <div className="mt-3 flex items-center gap-2">
          {renderEligibilityBadge()}
          <span className="text-[11px] text-zinc-400">
            Min CGPA: <strong className="text-zinc-700 font-mono">{scholarship.minCGPA.toFixed(2)}</strong> | IELTS: <strong className="text-zinc-700 font-mono">{scholarship.minIELTS > 0 ? scholarship.minIELTS.toFixed(1) : "None"}</strong>
          </span>
        </div>

        {/* Financial Summary Box */}
        <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
          <div className="grid grid-cols-3 divide-x divide-zinc-200/80 text-center text-xs">
            {/* Monthly Stipend */}
            <div className="px-1.5">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Stipend
              </span>
              <span className="mt-0.5 block font-mono font-bold text-zinc-900">
                ${scholarship.monthlyStipendUSD.toLocaleString()}
                <span className="text-[10px] font-normal text-zinc-500">/mo</span>
              </span>
            </div>

            {/* Est Living Cost */}
            <div className="px-1.5">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Living Cost
              </span>
              <span className="mt-0.5 block font-mono font-medium text-zinc-700">
                ~${scholarship.estimatedLivingCostUSD.toLocaleString()}
                <span className="text-[10px] font-normal text-zinc-400">/mo</span>
              </span>
            </div>

            {/* Net Monthly Savings */}
            <div className="px-1.5">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-emerald-800 flex items-center justify-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" /> Net Savings
              </span>
              <span
                className={`mt-0.5 block font-mono font-extrabold ${
                  maxSavings >= 0 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {isMultiUni
                  ? `+$${minSavings}–$${maxSavings}`
                  : maxSavings >= 0
                  ? `+$${maxSavings.toLocaleString()}`
                  : `-$${Math.abs(maxSavings).toLocaleString()}`}
                <span className="text-[10px] font-normal text-emerald-600/80">/mo</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Deadline Badge & Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
        {/* Deadline Badge */}
        <div
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
            isExpired
              ? "bg-zinc-100 text-zinc-500"
              : isClosingSoon
              ? "border border-amber-200 bg-amber-50 text-amber-800"
              : "border border-zinc-200 bg-white text-zinc-600"
          }`}
        >
          {isClosingSoon ? (
            <Clock className="h-3 w-3 text-amber-600 shrink-0" />
          ) : (
            <Calendar className="h-3 w-3 text-zinc-400 shrink-0" />
          )}
          <span>
            {isExpired ? "Passed" : isClosingSoon ? `${days}d left (${formattedDate})` : formattedDate}
          </span>
        </div>

        {/* Right side: Admin actions or "View Details" */}
        <div className="flex items-center gap-1">
          {isAdmin ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                title="Edit scholarship"
              >
                <Edit2 className="h-3 w-3 text-zinc-500" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center rounded-lg border border-red-200 bg-white p-1 text-red-600 hover:bg-red-50"
                title="Delete scholarship"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              <span>View</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
