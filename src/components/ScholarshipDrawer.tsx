"use client";

import React, { useState, useEffect } from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { PartnerUniversity } from "../types/scholarship";
import {
  calculateDaysRemaining,
  checkEligibility,
} from "../utils/scholarshipUtils";
import {
  X,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Plane,
  Home,
  Shield,
  BookOpen,
  DollarSign,
  TrendingUp,
  FileCheck,
  Edit2,
  Trash2,
  Sliders,
  Award,
  Landmark,
  Microscope,
  HelpCircle,
  Mail,
  Check,
} from "lucide-react";

export const ScholarshipDrawer: React.FC = () => {
  const {
    selectedScholarship,
    setSelectedScholarship,
    profile,
    isAdmin,
    setEditingScholarship,
    setIsAddModalOpen,
    deleteScholarship,
    documentChecklist,
    toggleDocumentCheck,
  } = useScholarship();

  // Local state for personal budget adjustment in interactive calculator
  const [personalExpenseAdjustment, setPersonalExpenseAdjustment] = useState<number>(0);
  // Selected partner university for multi-uni scholarships
  const [selectedPartnerUni, setSelectedPartnerUni] = useState<PartnerUniversity | null>(null);

  // Reset adjustment & partner uni whenever selected scholarship changes
  useEffect(() => {
    setPersonalExpenseAdjustment(0);
    if (selectedScholarship?.partnerUniversities && selectedScholarship.partnerUniversities.length > 0) {
      setSelectedPartnerUni(selectedScholarship.partnerUniversities[0]);
    } else {
      setSelectedPartnerUni(null);
    }
  }, [selectedScholarship?.id]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedScholarship(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedScholarship]);

  if (!selectedScholarship) return null;

  const s = selectedScholarship;
  const eligibility = checkEligibility(s, profile);

  // If a partner uni is selected, use its numbers for the interactive breakdown; otherwise use scholarship baseline
  const activeStipend = selectedPartnerUni
    ? selectedPartnerUni.monthlyStipend
    : s.monthlyStipendUSD;
  const activeLivingCostBase = selectedPartnerUni
    ? selectedPartnerUni.estimatedLivingCost
    : s.estimatedLivingCostUSD;

  const effectiveLivingCost = Math.max(0, activeLivingCostBase + personalExpenseAdjustment);
  const adjustedNetSavings = activeStipend - effectiveLivingCost;

  const { days, isClosingSoon, isExpired, formattedDate } =
    calculateDaysRemaining(s.deadline);

  const handleEdit = () => {
    setEditingScholarship(s);
    setIsAddModalOpen(true);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${s.name}"? This cannot be undone.`
      )
    ) {
      deleteScholarship(s.id);
      setSelectedScholarship(null);
    }
  };

  // Count checked documents for this scholarship
  const checkedDocsCount = s.requiredDocuments.filter(
    (doc) => !!documentChecklist[`${s.id}::${doc}`]
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedScholarship(null)}
      />

      {/* Drawer Container */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform animate-in slide-in-from-right duration-250 ease-out">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{s.countryFlag || "🌍"}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {s.city}, {s.country}
                </span>
                <span className="rounded-sm bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-600 font-medium">
                  {s.region}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-medium text-zinc-800">{s.university}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}

            <button
              onClick={() => setSelectedScholarship(null)}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              title="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-5 sm:space-y-6">
          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Funding Type Badge */}
              <span className="rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-800 border border-purple-200/60 flex items-center gap-1">
                {s.fundingType === "Gov / Multi-Uni" && <Landmark className="h-3 w-3" />}
                {s.fundingType === "Supervisor / RA-TA" && <Microscope className="h-3 w-3" />}
                {s.fundingType === "University Direct" && <GraduationCap className="h-3 w-3" />}
                <span>{s.fundingType}</span>
              </span>

              {/* Supervisor Requirement Badge */}
              <span className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                {s.supervisorRequired}
              </span>

              {s.degrees.map((deg) => (
                <span
                  key={deg}
                  className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800"
                >
                  {deg}
                </span>
              ))}
              <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {s.field}
              </span>

              {/* Deadline Badge */}
              <span
                className={`ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isExpired
                    ? "bg-zinc-100 text-zinc-500"
                    : isClosingSoon
                    ? "border border-amber-300 bg-amber-50 text-amber-900"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-700"
                }`}
              >
                {isClosingSoon ? (
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                )}
                <span>
                  {isExpired ? "Passed" : isClosingSoon ? `${days} days left` : formattedDate}
                </span>
              </span>
            </div>

            <h2 className="text-xl font-bold text-zinc-950">{s.name}</h2>
            {s.fieldSpecifics && (
              <p className="mt-1 text-xs text-zinc-500">
                Specializations: <span className="text-zinc-700">{s.fieldSpecifics}</span>
              </p>
            )}
          </div>

          {/* Interactive Multi-University & City Savings Selector (If Partner Unis Exist) */}
          {s.partnerUniversities && s.partnerUniversities.length > 0 && (
            <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/60 to-purple-50/30 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-indigo-600" />
                  Participating Universities &amp; City-by-City Savings
                </h3>
                <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  {s.partnerUniversities.length} Institutions Available
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 mb-3">
                Click any participating university below to view its specific city living cost and net monthly savings:
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {s.partnerUniversities.map((uni, idx) => {
                  const isSelected = selectedPartnerUni?.name === uni.name;
                  const uniSavings = uni.monthlyStipend - uni.estimatedLivingCost;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPartnerUni(uni)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-500/30"
                          : "border-zinc-200/90 bg-white/80 hover:bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-semibold text-xs text-zinc-900 line-clamp-1">
                          {uni.flag} {uni.name}
                        </div>
                        {isSelected && (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500 flex items-center justify-between">
                        <span>{uni.city}, {uni.country}</span>
                        <span className="font-mono font-bold text-emerald-700">
                          +${uniSavings}/mo
                        </span>
                      </div>
                      {uni.rankingOrNote && (
                        <div className="mt-1 text-[10px] text-indigo-700 font-medium truncate">
                          {uni.rankingOrNote}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Supervisor & Lab Funding Guide (For Supervisor / RA-TA tracks) */}
          {s.fundingType === "Supervisor / RA-TA" && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-950 mb-1.5">
                <Microscope className="h-4 w-4 text-blue-600" />
                <span>Supervisor &amp; Lab Funding Match Guide</span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed mb-3">
                {s.supervisorFundingGuide ||
                  "This program provides guaranteed financial coverage via Professor Research Assistantships (RA) or Department Teaching Assistantships (TA). Securing a supervisor match before submitting your application confirms your multi-year stipend and tuition waiver."}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-md bg-white px-2 py-1 font-medium text-blue-800 border border-blue-200">
                  💡 Tip: Attach CV &amp; 1-page research pitch
                </span>
                <span className="rounded-md bg-white px-2 py-1 font-medium text-blue-800 border border-blue-200">
                  🎯 Cite 2 recent papers from the professor&apos;s lab
                </span>
              </div>
            </div>
          )}

          {/* Dynamic Eligibility Comparison Banner */}
          <div
            className={`rounded-2xl border p-4 ${
              eligibility.isEligible
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                : "border-amber-200 bg-amber-50/70 text-amber-950"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {eligibility.isEligible ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>You Are 100% Eligible For This Scholarship!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>Eligibility Check Summary</span>
                </>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="rounded-lg bg-white/80 p-2 shadow-2xs">
                <span className="block text-[10px] text-zinc-500 font-medium">Min CGPA</span>
                <span className="font-mono font-bold text-zinc-900">
                  {s.minCGPA.toFixed(2)}
                </span>
                <span
                  className={`ml-1 text-[10px] font-semibold ${
                    eligibility.cgpaPass ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  ({eligibility.cgpaPass ? "Passed" : "Low"})
                </span>
              </div>

              <div className="rounded-lg bg-white/80 p-2 shadow-2xs">
                <span className="block text-[10px] text-zinc-500 font-medium">Min IELTS</span>
                <span className="font-mono font-bold text-zinc-900">
                  {s.minIELTS > 0 ? s.minIELTS.toFixed(1) : "None"}
                </span>
                <span
                  className={`ml-1 text-[10px] font-semibold ${
                    eligibility.ieltsPass ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  ({eligibility.ieltsPass ? "Passed" : "Low"})
                </span>
              </div>

              <div className="rounded-lg bg-white/80 p-2 shadow-2xs">
                <span className="block text-[10px] text-zinc-500 font-medium">Degree Level</span>
                <span className="font-semibold text-zinc-900">
                  {s.degrees.join("/")}
                </span>
                <span
                  className={`ml-1 text-[10px] font-semibold ${
                    eligibility.degreePass ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  ({eligibility.degreePass ? "Match" : "Diff"})
                </span>
              </div>

              <div className="rounded-lg bg-white/80 p-2 shadow-2xs">
                <span className="block text-[10px] text-zinc-500 font-medium">Medium</span>
                <span className="font-semibold text-zinc-900">{s.medium}</span>
                <span className="ml-1 text-[10px] font-semibold text-emerald-600">
                  (OK)
                </span>
              </div>
            </div>

            {!eligibility.isEligible && eligibility.reasons.length > 0 && (
              <div className="mt-3 rounded-lg bg-white/90 p-2.5 text-xs text-amber-900 border border-amber-200">
                <p className="font-semibold mb-1">To become eligible:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {eligibility.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Interactive Financial Calculator & Breakdown */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Financial Breakdown &amp; Living Cost Calculator
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Net: +${adjustedNetSavings.toLocaleString()}/mo
              </span>
            </div>

            {selectedPartnerUni && (
              <div className="mt-2.5 text-xs text-indigo-700 font-medium">
                📍 Showing live calculations for: <strong>{selectedPartnerUni.name}</strong> ({selectedPartnerUni.city})
              </div>
            )}

            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Monthly Stipend
                </span>
                <span className="mt-1 block font-mono text-base font-extrabold text-zinc-900">
                  ${activeStipend.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400">Fixed grant</span>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Est. Living Cost
                </span>
                <span className="mt-1 block font-mono text-base font-bold text-zinc-800">
                  ${effectiveLivingCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400">Rent, food, transit</span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Net Savings
                </span>
                <span className="mt-1 block font-mono text-base font-extrabold text-emerald-700">
                  {adjustedNetSavings >= 0 ? `+$${adjustedNetSavings.toLocaleString()}` : `-$${Math.abs(adjustedNetSavings).toLocaleString()}`}
                </span>
                <span className="text-[10px] text-emerald-600/80">Every month</span>
              </div>
            </div>

            {/* Interactive Expense Adjuster */}
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3.5">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                  Personal Lifestyle Budget Adjustment
                </span>
                <span className="font-mono font-bold text-zinc-900">
                  {personalExpenseAdjustment >= 0 ? `+$${personalExpenseAdjustment}` : `-$${Math.abs(personalExpenseAdjustment)}`}/mo
                </span>
              </div>
              <input
                type="range"
                min="-300"
                max="500"
                step="50"
                value={personalExpenseAdjustment}
                onChange={(e) => setPersonalExpenseAdjustment(parseInt(e.target.value, 10))}
                className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-indigo-600"
              />
              <div className="mt-1 flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Frugal (-$300)</span>
                <span>Base Average ($0)</span>
                <span>Comfortable (+$500)</span>
              </div>
            </div>
          </div>

          {/* All Scholarship Facilities & Benefits */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5 mb-3">
              <Award className="h-4 w-4 text-indigo-600" />
              Full Scholarship Facilities &amp; Perks
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {s.facilities.map((facility, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-800"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Required Documents Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-indigo-600" />
                Required Documents Checklist
              </h3>
              <span className="text-xs font-semibold text-zinc-500">
                {checkedDocsCount} of {s.requiredDocuments.length} ready
              </span>
            </div>

            <div className="space-y-2">
              {s.requiredDocuments.map((doc, idx) => {
                const isChecked = !!documentChecklist[`${s.id}::${doc}`];
                return (
                  <label
                    key={idx}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition-colors ${
                      isChecked
                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-950 font-medium"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDocumentCheck(s.id, doc)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={isChecked ? "line-through text-zinc-500" : ""}>
                      {doc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* University Overview & Campus Research */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-bold text-zinc-900 mb-2">
              University Overview &amp; Academic Prestige
            </h3>
            <p className="text-xs leading-relaxed text-zinc-600">{s.overview}</p>
          </div>

          {/* City Life & Expat Experience */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-indigo-500" />
              Living in {s.city}, {s.country}
            </h3>
            <p className="text-xs leading-relaxed text-zinc-600">
              {s.cityLifeOverview}
            </p>
          </div>
        </div>

        {/* Drawer Footer with Official Website Link */}
        <div className="border-t border-zinc-200 bg-white px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="text-center sm:text-left text-xs text-zinc-500">
            Last verified for 2026/2027 intake
          </div>

          <a
            href={s.officialWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full sm:w-auto"
          >
            <span>Visit Official Application Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
