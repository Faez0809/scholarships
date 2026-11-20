"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, RotateCcw, UserRound, Pencil } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { useGuide } from "../context/GuideContext";
import { FundingType, MediumOfInstruction, UserProfile } from "../types/scholarship";
import { FUNDING_HELP, FUNDING_LABELS, InfoTip, JARGON, useDialog } from "./ui";

const FIELD_OPTIONS: { value: string; label: string }[] = [
  { value: "All", label: "Any field" },
  { value: "Computer Science & AI", label: "Computer Science & AI" },
  { value: "Engineering", label: "Engineering & Technology" },
  { value: "Life Sciences", label: "Life & Bio Sciences" },
  { value: "Business & Social Sciences", label: "Business & Social Sciences" },
];

const selectClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

/** Compact one-line summary shown above results on phones and tablets. */
export const ProfileSummaryBar: React.FC = () => {
  const { profile, stats } = useScholarship();
  const { setIsProfileOpen } = useGuide();
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 lg:hidden">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
        <UserRound className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900">
          You match <span className="text-emerald-700">{stats.eligibleCount}</span> of {stats.total}
        </p>
        <p className="truncate text-xs text-zinc-500">
          {profile.targetDegree === "Both" ? "Master's or PhD" : profile.targetDegree} · CGPA {profile.cgpa.toFixed(2)} · IELTS{" "}
          {profile.ielts.toFixed(1)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsProfileOpen(true)}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </button>
    </div>
  );
};

/** The profile form: sticky sidebar on desktop, bottom sheet on smaller screens. */
export const ProfilePanel: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, markStep } = useGuide();
  const { stats } = useScholarship();

  const sheetRef = useRef<HTMLDivElement>(null);
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useDialog(isProfileOpen && isSmall, sheetRef);

  useEffect(() => {
    if (!isProfileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsProfileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isProfileOpen, setIsProfileOpen]);

  const done = () => {
    markStep("profile");
    setIsProfileOpen(false);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside id="profile-panel" aria-labelledby="profile-title-desktop" className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-20 rounded-xl border border-zinc-200 bg-white">
          <ProfileForm titleId="profile-title-desktop" onDone={done} matchCount={stats.eligibleCount} />
        </div>
      </aside>

      {/* Phone / tablet sheet */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="profile-title-sheet">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsProfileOpen(false)} />
          <div ref={sheetRef} className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl bg-white shadow-xl">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-zinc-300" aria-hidden="true" />
            <div className="flex items-center justify-end px-3 pt-1">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label="Close profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <ProfileForm titleId="profile-title-sheet" onDone={done} matchCount={stats.eligibleCount} sheet />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProfileForm: React.FC<{ titleId: string; onDone: () => void; matchCount: number; sheet?: boolean }> = ({
  titleId,
  onDone,
  matchCount,
  sheet,
}) => {
  const { profile, updateProfileField, resetProfile, stats } = useScholarship();
  const pct = stats.total ? Math.round((stats.eligibleCount / stats.total) * 100) : 0;

  return (
    <div className="text-sm">
      <div className="flex items-start justify-between gap-2 px-5 pb-3 pt-1 lg:pt-5">
        <div>
          <h2 id={titleId} className="text-base font-semibold text-zinc-900">
            Your profile
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">Used to check which scholarships you qualify for.</p>
        </div>
        <button
          type="button"
          onClick={resetProfile}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="mx-5 rounded-lg bg-zinc-50 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium text-zinc-700">
            You qualify for
            <InfoTip text={JARGON.eligible} />
          </span>
          <span className="font-semibold text-zinc-900">
            {stats.eligibleCount} of {stats.total}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <fieldset className="mt-5 space-y-4 px-5">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">About you</legend>

        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-700" id="degree-label">I want to study</p>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1" role="radiogroup" aria-labelledby="degree-label">
            {(["Both", "Master's", "PhD"] as const).map((deg) => (
              <button
                key={deg}
                type="button"
                role="radio"
                aria-checked={profile.targetDegree === deg}
                onClick={() => updateProfileField("targetDegree", deg)}
                className={`rounded-md py-1.5 text-xs font-medium transition ${
                  profile.targetDegree === deg ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {deg === "Both" ? "Either" : deg}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-700">My field</span>
          <select className={selectClass} value={profile.majorCategory} onChange={(e) => updateProfileField("majorCategory", e.target.value)}>
            {FIELD_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <Slider
          label="My CGPA (out of 4.00)"
          value={profile.cgpa}
          display={profile.cgpa.toFixed(2)}
          min={2}
          max={4}
          step={0.05}
          onChange={(v) => updateProfileField("cgpa", v)}
        />
        <Slider
          label="My IELTS score"
          value={profile.ielts}
          display={profile.ielts.toFixed(1)}
          min={5}
          max={9}
          step={0.5}
          onChange={(v) => updateProfileField("ielts", v)}
        />

        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-700" id="medium-label">Language of teaching</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1" role="radiogroup" aria-labelledby="medium-label">
            {(["English Only", "Any"] as MediumOfInstruction[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={profile.mediumPreference === m}
                onClick={() => updateProfileField("mediumPreference", m)}
                className={`rounded-md py-1.5 text-xs font-medium transition ${
                  profile.mediumPreference === m ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {m === "Any" ? "Any language" : "English only"}
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-6 space-y-4 border-t border-zinc-100 px-5 pt-5">
        <legend className="mb-3 pt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">What I&apos;m looking for</legend>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-zinc-700">
            Type of funding
            <InfoTip
              text={`${FUNDING_LABELS["Gov / Multi-Uni"]}: ${FUNDING_HELP["Gov / Multi-Uni"]} ${FUNDING_LABELS["Supervisor / RA-TA"]}: ${FUNDING_HELP["Supervisor / RA-TA"]}`}
            />
          </span>
          <select
            className={selectClass}
            value={profile.fundingTypePreference || "All"}
            onChange={(e) => updateProfileField("fundingTypePreference", e.target.value as "All" | FundingType)}
          >
            <option value="All">Any type</option>
            {(Object.keys(FUNDING_LABELS) as FundingType[]).map((f) => (
              <option key={f} value={f}>
                {FUNDING_LABELS[f]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-700">Contacting a professor first</span>
          <select
            className={selectClass}
            value={profile.supervisorPreference || "All"}
            onChange={(e) => updateProfileField("supervisorPreference", e.target.value as UserProfile["supervisorPreference"])}
          >
            <option value="All">I don&apos;t mind</option>
            <option value="No Supervisor Needed">Only programs where I don&apos;t need to</option>
            <option value="Supervisor Allowed">Include programs where I need to</option>
          </select>
        </label>

        <Slider
          label="Money left each month, at least"
          help={JARGON.leftEachMonth}
          value={profile.minSavingsDesired}
          display={`$${profile.minSavingsDesired}`}
          min={0}
          max={1500}
          step={50}
          onChange={(v) => updateProfileField("minSavingsDesired", Math.round(v))}
        />

        <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-zinc-200 p-3">
          <span>
            <span className="block text-xs font-medium text-zinc-800">Only show scholarships I qualify for</span>
            <span className="mt-0.5 block text-[11px] text-zinc-500">Hides programs where your CGPA, IELTS, degree or savings fall short.</span>
          </span>
          <input
            type="checkbox"
            checked={profile.onlyEligible}
            onChange={(e) => updateProfileField("onlyEligible", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 accent-indigo-600"
          />
        </label>
      </fieldset>

      <div className={`border-t border-zinc-100 p-4 ${sheet ? "sticky bottom-0 bg-white" : "mt-5"}`}>
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {sheet ? `Show my ${matchCount} matches` : "Save profile"}
        </button>
        <p className="mt-2 text-center text-[11px] text-zinc-500">Results update as you change anything.</p>
      </div>
    </div>
  );
};

const Slider: React.FC<{
  label: string;
  help?: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}> = ({ label, help, value, display, min, max, step, onChange }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <span className="flex items-center gap-1 text-xs font-medium text-zinc-700">
        {label}
        {help && <InfoTip text={help} />}
      </span>
      <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 font-mono text-xs font-semibold text-zinc-900">{display}</span>
    </div>
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-1.5 w-full cursor-pointer accent-indigo-600"
    />
  </div>
);
