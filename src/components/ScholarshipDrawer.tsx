"use client";

import React, { useState, useEffect, useRef } from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { PartnerUniversity } from "../types/scholarship";
import { useGuide } from "../context/GuideContext";
import { FUNDING_HELP, FUNDING_LABELS, InfoTip, JARGON, SUPERVISOR_LABELS, coverageItems, fundingLevel, useDialog } from "./ui";
import { nationalityLabel, nationalityNote, nationalityStatus } from "../data/nationality";
import { AGE_LIMITS, englishTestExpired } from "../data/rules";
import { UniversityGallery } from "./UniversityGallery";
import { listingStatus } from "./BrowseParts";
import { Bookmark, BookmarkCheck } from "lucide-react";
import {
  calculateDaysRemaining,
  formatSignedUSD,
  formatVerifiedDate,
  checkEligibility,
} from "../utils/scholarshipUtils";
import {
  X,
  ExternalLink,
  Building2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  FileCheck,
  Edit2,
  Trash2,
  Award,
  Landmark,
  Microscope,
  Check,
  Share2,
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
    openSupervisorFinder,
  } = useScholarship();
  const { isSavedScholarship, toggleSavedScholarship } = useGuide();

  // Local state for personal budget adjustment in interactive calculator
  const [personalExpenseAdjustment, setPersonalExpenseAdjustment] = useState<number>(0);
  // Selected partner university for multi-uni scholarships
  const [selectedPartnerUni, setSelectedPartnerUni] = useState<PartnerUniversity | null>(null);

  // Reset adjustment & partner uni whenever a different scholarship is opened
  const [shownId, setShownId] = useState<string | null>(null);
  if ((selectedScholarship?.id ?? null) !== shownId) {
    setShownId(selectedScholarship?.id ?? null);
    setPersonalExpenseAdjustment(0);
    setSelectedPartnerUni(selectedScholarship?.partnerUniversities?.[0] ?? null);
  }

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

  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(!!selectedScholarship, panelRef);

  if (!selectedScholarship) return null;

  const s = selectedScholarship;
  const eligibility = checkEligibility(s, profile);
  const docsReady = s.requiredDocuments.filter((d) => documentChecklist[`${s.id}::${d}`]).length;

  // If a partner uni is selected, use its numbers for the interactive breakdown; otherwise use scholarship baseline
  const activeStipend = selectedPartnerUni
    ? selectedPartnerUni.monthlyStipend
    : s.monthlyStipendUSD;
  const activeLivingCostBase = selectedPartnerUni
    ? selectedPartnerUni.estimatedLivingCost
    : s.estimatedLivingCostUSD;

  const effectiveLivingCost = Math.max(0, activeLivingCostBase + personalExpenseAdjustment);
  const adjustedNetSavings = activeStipend - effectiveLivingCost;

  const { isExpired, formattedDate } =
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
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={s.name}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedScholarship(null)}
      />

      {/* Drawer Container */}
      <div ref={panelRef} tabIndex={-1} className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white outline-none shadow-2xl transition-transform animate-in slide-in-from-right duration-250 ease-out">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3.5 sm:px-6 sm:py-4">
          <p className={`text-sm ${listingStatus(s).className}`}>{listingStatus(s).text}</p>
          <div className="ml-auto mr-1">
            <ShareButton id={s.id} name={s.name} />
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900"
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
              className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close details"
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
              <span className="flex items-center gap-1 rounded-md border border-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700">
                {s.fundingType === "Gov / Multi-Uni" && <Landmark className="h-3 w-3" />}
                {s.fundingType === "Supervisor / RA-TA" && <Microscope className="h-3 w-3" />}
                {s.fundingType === "University Direct" && <GraduationCap className="h-3 w-3" />}
                <span>{FUNDING_LABELS[s.fundingType]}</span>
                <InfoTip text={FUNDING_HELP[s.fundingType]} />
              </span>

              {/* Supervisor Requirement Badge */}
              <span className="rounded-md border border-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700">
                {SUPERVISOR_LABELS[s.supervisorRequired]}
              </span>

              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-800">
                {s.degrees.join(" & ")}
              </span>
              <span className="px-1 py-0.5 text-xs text-stone-500">{s.field}</span>
            </div>

            <h2 className="font-serif text-2xl font-semibold leading-snug text-stone-950">{s.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-700">
              <Building2 className="h-4 w-4 shrink-0 text-stone-400" />
              {s.university}
            </p>
            <p className="mt-0.5 pl-[22px] text-xs text-stone-500">
              {s.city}, {s.country} · {s.region}
            </p>
            <p className="mt-2 text-xs text-stone-500">
              {s.lastVerified ? `Checked on ${formatVerifiedDate(s.lastVerified)}` : "Not yet checked"} ·{" "}
              <a href={s.officialWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline">
                Official page
              </a>
            </p>
            {s.fieldSpecifics && (
              <p className="mt-1 text-xs text-stone-500">
                Specializations: <span className="text-stone-700">{s.fieldSpecifics}</span>
              </p>
            )}

            {(s.deadlineNote || s.stipendNote) && (
              <dl className="mt-3 space-y-2 rounded-xl border border-stone-200 bg-white p-3 text-xs">
                {s.deadlineNote && (
                  <div>
                    <dt className="font-semibold text-stone-800">
                      Deadline{s.deadlineIsEstimate ? " (expected, not yet announced)" : ""}
                    </dt>
                    <dd className="mt-0.5 text-stone-600">{s.deadlineNote}</dd>
                  </div>
                )}
                {s.stipendNote && (
                  <div>
                    <dt className="font-semibold text-stone-800">
                      Stipend{s.stipendIsEstimate ? " (USD figure is approximate)" : ""}
                    </dt>
                    <dd className="mt-0.5 text-stone-600">{s.stipendNote}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {/* What to do next */}
          <section aria-labelledby="next-steps-title" className="rounded-xl border border-stone-200">
            <h3 id="next-steps-title" className="border-b border-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-900">
              What to do next
            </h3>
            <ol className="divide-y divide-stone-100 text-sm">
              <NextStep
                n={1}
                done={eligibility.isEligible}
                title={eligibility.isEligible ? "You meet the requirements" : "Check the requirements"}
                detail={
                  eligibility.isEligible
                    ? `Minimum CGPA ${s.minCGPA.toFixed(2)}, IELTS ${s.minIELTS > 0 ? s.minIELTS.toFixed(1) : "not required"}.`
                    : eligibility.reasons[0] || "Some requirements are not met yet."
                }
                action={
                  <a href="#drawer-eligibility" className="-my-1.5 -mr-1 inline-block rounded px-1 py-1.5 text-xs font-medium text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                    See details
                  </a>
                }
              />
              <NextStep
                n={2}
                done={docsReady === s.requiredDocuments.length && s.requiredDocuments.length > 0}
                title="Prepare your documents"
                detail={`${docsReady} of ${s.requiredDocuments.length} ready. Tick them off as you go.`}
                action={
                  <a href="#drawer-documents" className="-my-1.5 -mr-1 inline-block rounded px-1 py-1.5 text-xs font-medium text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                    Checklist
                  </a>
                }
              />
              {s.supervisorRequired !== "Not Required (Central Admission)" && (
                <NextStep
                  n={3}
                  done={false}
                  title={s.supervisorRequired === "Mandatory Before Applying" ? "Find a supervisor first" : "Contact a supervisor"}
                  detail={`Look for professors at ${selectedPartnerUni?.name || s.university} who work on your topic.`}
                  action={
                    <button
                      type="button"
                      onClick={() =>
                        openSupervisorFinder(selectedPartnerUni?.name || s.university, (s.fieldSpecifics || "").split(",")[0]?.trim() || "")
                      }
                      className="-my-1.5 -mr-1 inline-block rounded px-1 py-1.5 text-xs font-medium text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      Find supervisors
                    </button>
                  }
                />
              )}
              <NextStep
                n={s.supervisorRequired !== "Not Required (Central Admission)" ? 4 : 3}
                done={false}
                title="Apply on the official website"
                detail={isExpired ? "This round has closed. Check the site for the next one." : `Deadline ${formattedDate}${s.deadlineIsEstimate ? " (expected)" : ""}.`}
                action={
                  <a href={s.officialWebsiteUrl} target="_blank" rel="noopener noreferrer" className="-my-1.5 -mr-1 inline-flex items-center gap-1 rounded px-1 py-1.5 text-xs font-medium text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                    Open site <ExternalLink className="h-3 w-3" />
                  </a>
                }
              />
            </ol>
          </section>

          {/* Interactive Multi-University & City Savings Selector (If Partner Unis Exist) */}
          {s.partnerUniversities && s.partnerUniversities.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-stone-500" />
                  Where you can study
                </h3>
                <span className="text-[10px] font-semibold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                  {s.partnerUniversities.length} options
                </span>
              </div>
              <p className="text-xs text-stone-900/80 mb-3">
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
                          ? "border-blue-700 bg-white shadow-xs ring-1 ring-blue-600/30"
                          : "border-stone-200/90 bg-white/80 hover:bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-semibold text-xs text-stone-900 line-clamp-1">
                          {uni.name}
                        </div>
                        {isSelected && (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-stone-500 flex items-center justify-between">
                        <span>{uni.city}, {uni.country}</span>
                        <span className={`font-semibold tabular-nums ${uniSavings >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                          {formatSignedUSD(uniSavings)}/mo
                        </span>
                      </div>
                      {uni.rankingOrNote && (
                        <div className="mt-1 text-[11px] text-stone-500 truncate">
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
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Microscope className="h-4 w-4 text-stone-500" />
                Funding comes through a supervisor
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
                {s.supervisorFundingGuide ||
                  "Funding is usually offered once a professor agrees to supervise you. Write to a few professors before you apply, with your CV and a one-page research idea that mentions their recent work."}
              </p>
            </div>
          )}

          {/* Requirements */}
          <section id="drawer-eligibility" aria-labelledby="eligibility-title" className="scroll-mt-4">
            <h3 id="eligibility-title" className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              {eligibility.isEligible ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-700" />
              )}
              {eligibility.isEligible ? "You meet the requirements" : "Requirements"}
            </h3>
            <dl className="mt-2 divide-y divide-stone-100 rounded-xl border border-stone-200 text-sm">
              {[
                { label: "Minimum CGPA", value: s.minCGPA.toFixed(2), ok: eligibility.cgpaPass },
                { label: "Minimum IELTS", value: s.minIELTS > 0 ? s.minIELTS.toFixed(1) : "Not required", ok: eligibility.ieltsPass },
                { label: "Degree", value: s.degrees.join(" & "), ok: eligibility.degreePass },
                { label: "Teaching language", value: s.medium === "Any" ? "English or local" : s.medium, ok: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-2">
                  <dt className="text-stone-600">{row.label}</dt>
                  <dd className="flex items-center gap-1.5 font-medium tabular-nums text-stone-900">
                    {row.value}
                    {row.ok ? (
                      <Check className="h-4 w-4 text-emerald-700" aria-label="met" />
                    ) : (
                      <X className="h-4 w-4 text-amber-700" aria-label="not met" />
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {!eligibility.isEligible && eligibility.reasons.length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-amber-900">
                {eligibility.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Money each month */}
          <section aria-labelledby="money-title">
            <h3 id="money-title" className="flex items-center gap-1.5 text-sm font-semibold text-stone-900">
              Money each month
              <InfoTip text={JARGON.leftEachMonth} />
            </h3>

            {selectedPartnerUni && (
              <p className="mt-1 text-xs text-stone-500">
                For {selectedPartnerUni.name} ({selectedPartnerUni.city})
              </p>
            )}

            <dl className="mt-2 divide-y divide-stone-100 rounded-xl border border-stone-200 text-sm">
              <div className="flex items-center justify-between px-3 py-2">
                <dt className="text-stone-600">Stipend</dt>
                <dd className="font-medium tabular-nums text-stone-900">${activeStipend.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <dt className="text-stone-600">Typical living cost</dt>
                <dd className="font-medium tabular-nums text-stone-900">−${effectiveLivingCost.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <dt className="font-medium text-stone-900">Left each month</dt>
                <dd className={`font-semibold tabular-nums ${adjustedNetSavings >= 0 ? "text-emerald-800" : "text-amber-800"}`}>
                  {formatSignedUSD(adjustedNetSavings)}
                </dd>
              </div>
            </dl>
            {/* Personal spending adjuster */}
            <div className="mt-3 px-1">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Adjust for your own spending</span>
                <span className="font-semibold tabular-nums text-stone-900">
                  {personalExpenseAdjustment >= 0 ? `+$${personalExpenseAdjustment}` : `-$${Math.abs(personalExpenseAdjustment)}`}/mo
                </span>
              </div>
              <input
                type="range"
                aria-label="Adjust your monthly living expenses"
                min="-300"
                max="500"
                step="50"
                value={personalExpenseAdjustment}
                onChange={(e) => setPersonalExpenseAdjustment(parseInt(e.target.value, 10))}
                className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-blue-700"
              />
              <div className="mt-1 flex justify-between text-[11px] text-stone-500">
                <span>Spend less</span>
                <span>Typical</span>
                <span>Spend more</span>
              </div>
            </div>
          </section>

          {/* What the funding covers */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Award className="h-4 w-4 text-stone-500" />
              What the funding covers
              <span className={`text-xs font-medium ${fundingLevel(s) === "Fully funded" ? "text-emerald-800" : "text-amber-800"}`}>
                {fundingLevel(s)}
              </span>
            </h3>
            <ul className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              {coverageItems(s).map((c) => (
                <li key={c.label} className={`flex items-center gap-1.5 ${c.covered ? "text-stone-800" : "text-stone-500"}`}>
                  {c.covered ? <Check className="h-4 w-4 text-emerald-700" /> : <X className="h-4 w-4 text-stone-400" />}
                  {c.label}
                  <span className="sr-only">{c.covered ? " covered" : " not covered"}</span>
                </li>
              ))}
            </ul>
            {profile.nationality && profile.nationality !== "OTHER" && (
              <p className="mb-4 text-sm text-stone-700">
                <span className="font-medium">{nationalityLabel(profile.nationality)} passport: </span>
                {nationalityStatus(s.id, profile.nationality) === "yes"
                  ? "eligible to apply."
                  : nationalityStatus(s.id, profile.nationality) === "no"
                  ? "not eligible for this program."
                  : "check the official country list."}
                {nationalityNote(s.id) && <span className="text-stone-500"> {nationalityNote(s.id)}</span>}
              </p>
            )}
            {(AGE_LIMITS[s.id] || englishTestExpired(profile.englishTestDate, s.deadline)) && (
              <ul className="mb-4 space-y-1 text-sm text-stone-700">
                {AGE_LIMITS[s.id] && (
                  <li>
                    <span className="font-medium">Age limit: </span>
                    {AGE_LIMITS[s.id].note}
                  </li>
                )}
                {englishTestExpired(profile.englishTestDate, s.deadline) && (
                  <li className="text-amber-800">
                    Your IELTS will be more than two years old by the deadline. Most programs need a recent result.
                  </li>
                )}
              </ul>
            )}
            <p className="mb-1.5 text-xs font-medium text-stone-500">From the official page</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700 marker:text-stone-300">
              {s.facilities.map((facility, idx) => (
                <li key={idx}>{facility}</li>
              ))}
            </ul>
          </div>

          {/* Complete Documents */}
          <div id="drawer-documents" className="scroll-mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-stone-500" />
                Documents
              </h3>
              <span className="text-xs font-semibold text-stone-500">
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
                        : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDocumentCheck(s.id, doc)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
                    />
                    <span className={isChecked ? "line-through text-stone-500" : ""}>
                      {doc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Campus photos and intro */}
          {!(s.fundingType === "Gov / Multi-Uni" && !(s.partnerUniversities && s.partnerUniversities.length)) && (
            <section aria-labelledby="campus-title">
              <h3 id="campus-title" className="mb-2 text-sm font-semibold text-stone-900">
                Campus: {selectedPartnerUni?.name || s.university}
              </h3>
              <UniversityGallery name={selectedPartnerUni?.name || s.university} compact />
            </section>
          )}

          {/* University Overview & Campus Research */}
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-stone-900 mb-2">
              About this program
            </h3>
            <p className="text-xs leading-relaxed text-stone-600">{s.overview}</p>
          </div>

          {/* City Life & Expat Experience */}
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-600" />
              Living in {s.city}, {s.country}
            </h3>
            <p className="text-xs leading-relaxed text-stone-600">
              {s.cityLifeOverview}
            </p>
          </div>
        </div>

        {/* Drawer Footer with Official Website Link */}
        <div className="grid grid-cols-2 gap-2 border-t border-stone-200 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => toggleSavedScholarship(s.id)}
            aria-pressed={isSavedScholarship(s.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            {isSavedScholarship(s.id) ? <BookmarkCheck className="h-4 w-4 text-blue-800" /> : <Bookmark className="h-4 w-4" />}
            {isSavedScholarship(s.id) ? "On shortlist" : "Add to shortlist"}
          </button>
          <a
            href={s.officialWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            Official page <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

const NextStep: React.FC<{
  n: number;
  done: boolean;
  title: string;
  detail: string;
  action: React.ReactNode;
}> = ({ n, done, title, detail, action }) => (
  <li className="flex items-start gap-3 px-4 py-3">
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
        done ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 text-stone-600"
      }`}
      aria-hidden="true"
    >
      {done ? <Check className="h-3 w-3" /> : n}
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-medium text-stone-900">
        {title}
        {done && <span className="sr-only"> (done)</span>}
      </p>
      <p className="text-xs text-stone-500">{detail}</p>
    </div>
    <div className="shrink-0 pt-0.5">{action}</div>
  </li>
);

const ShareButton: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/scholarship/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed or clipboard unavailable; nothing to do.
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
    >
      <Share2 className="h-4 w-4" /> {copied ? "Link copied" : "Share"}
    </button>
  );
};
