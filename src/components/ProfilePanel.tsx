"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { useGuide } from "../context/GuideContext";
import { MediumOfInstruction, UserProfile } from "../types/scholarship";
import { NATIONALITIES } from "../data/nationality";
import { InfoTip, JARGON, useDialog } from "./ui";
import { FieldPicker } from "./FieldPicker";
import { Avatar } from "./Avatar";
import { useAccount } from "../context/AccountContext";

export const selectClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

/**
 * "Your profile": a sheet from the bottom on phones and from the right on larger screens.
 * Every change applies (and saves) immediately; there is no separate save step.
 */
export const ProfilePanel: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, markStep } = useGuide();
  const { stats, setActivePill, activeView, updateProfileField } = useScholarship();
  const { session, email, avatarUrl, setIsAccountOpen } = useAccount();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(isProfileOpen, ref);

  useEffect(() => {
    if (!isProfileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsProfileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isProfileOpen, setIsProfileOpen]);

  if (!isProfileOpen) return null;

  const close = () => setIsProfileOpen(false);
  const confirm = () => {
    updateProfileField("isSet", true);
    markStep("profile");
    setIsProfileOpen(false);
  };

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div
        ref={ref}
        className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl bg-white shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none"
      >
        <div className="flex items-start justify-between gap-2 border-b border-stone-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {session && (
              <button
                type="button"
                onClick={() => setIsAccountOpen(true)}
                className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                aria-label="Account settings and profile picture"
              >
                <Avatar url={avatarUrl} email={email} size={44} />
              </button>
            )}
            <div className="min-w-0">
              <h2 id="profile-title" className="font-serif text-xl font-semibold text-stone-900">
                Your profile
              </h2>
              <p className="mt-0.5 text-sm text-stone-500">Used to check what you qualify for. Saved automatically.</p>
            </div>
          </div>
          <button type="button" onClick={close} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100" aria-label="Close profile">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ProfileFields />
        </div>
        <div className="border-t border-stone-100 p-4">
          <button
            type="button"
            onClick={() => {
              confirm();
              if (activeView === "scholarships") setActivePill("eligible");
            }}
            className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {activeView === "scholarships" ? `Show the ${stats.eligibleCount} I qualify for` : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProfileFields: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { profile, updateProfileField, resetProfile } = useScholarship();
  const [cgpaDraft, setCgpaDraft] = useState("");

  return (
    <div className="space-y-5 text-sm">
      <Segmented
        label="I want to study"
        value={profile.targetDegree}
        options={[
          { value: "Both", label: "Either" },
          { value: "Master's", label: "Master's" },
          { value: "PhD", label: "PhD" },
        ]}
        onChange={(v) => updateProfileField("targetDegree", v as UserProfile["targetDegree"])}
      />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-stone-700">My field</span>
        <FieldPicker
          category={profile.majorCategory}
          text={profile.majorText}
          onChange={(category, text) => {
            updateProfileField("majorCategory", category);
            updateProfileField("majorText", text);
          }}
        />
        <p className="mt-1 text-xs text-stone-500">Type your department, its short form or a topic. Results show programs open to your field.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">CGPA (of 4.00)</span>
          <input
            type="number"
            inputMode="decimal"
            min={2}
            max={4}
            step={0.01}
            value={profile.isSet ? profile.cgpa : cgpaDraft}
            placeholder="e.g. 3.40"
            onChange={(e) => {
              setCgpaDraft(e.target.value);
              const v = parseFloat(e.target.value);
              if (!Number.isNaN(v)) updateProfileField("cgpa", Math.min(4, Math.max(0, v)));
            }}
            className={`${selectClass} tabular-nums`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">IELTS</span>
          <select
            className={`${selectClass} tabular-nums`}
            value={profile.ielts.toFixed(1)}
            onChange={(e) => updateProfileField("ielts", parseFloat(e.target.value))}
          >
            {Array.from({ length: 9 }, (_, i) => 5 + i * 0.5).map((v) => (
              <option key={v} value={v.toFixed(1)}>
                {v.toFixed(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-stone-700">
          My passport
          <InfoTip text="We use this to show whether each program accepts applicants from your country." />
        </span>
        <select className={selectClass} value={profile.nationality || ""} onChange={(e) => updateProfileField("nationality", e.target.value)}>
          <option value="">Prefer not to say</option>
          {NATIONALITIES.map((n) => (
            <option key={n.code} value={n.code}>
              {n.label}
            </option>
          ))}
        </select>
      </label>

      {!compact && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">Year of birth</span>
              <input
                type="number"
                inputMode="numeric"
                min={1960}
                max={2012}
                placeholder="Optional"
                value={profile.birthYear ?? ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  updateProfileField("birthYear", Number.isNaN(v) ? undefined : v);
                }}
                className={`${selectClass} tabular-nums`}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">IELTS test month</span>
              <input
                type="month"
                value={profile.englishTestDate ?? ""}
                onChange={(e) => updateProfileField("englishTestDate", e.target.value || undefined)}
                className={`${selectClass} tabular-nums`}
              />
            </label>
          </div>
          <p className="-mt-3 text-xs text-stone-500">Optional. Used to warn you about age limits and test results older than two years.</p>
          <Segmented
            label="Language of teaching"
            value={profile.mediumPreference}
            options={[
              { value: "English Only", label: "English only" },
              { value: "Any", label: "Any language" },
            ]}
            onChange={(v) => updateProfileField("mediumPreference", v as MediumOfInstruction)}
          />
          <p className="flex items-start gap-1 text-xs text-stone-500">
            Eligibility checks CGPA, IELTS, degree level, field, language and passport.
            <InfoTip text={JARGON.eligible} />
          </p>
          <button type="button" onClick={resetProfile} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800">
            <RotateCcw className="h-3 w-3" /> Clear my profile
          </button>
        </>
      )}
    </div>
  );
};

const Segmented: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => {
  const id = "seg-" + label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-stone-700" id={id}>
        {label}
      </p>
      <div
        className="grid gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        role="radiogroup"
        aria-labelledby={id}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md py-1.5 text-sm font-medium transition ${
              value === o.value ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
};
