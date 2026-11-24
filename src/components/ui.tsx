"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { FundingType, SupervisorRequirement } from "../types/scholarship";

/* ------------------------------------------------------------------ */
/* Plain-language labels                                               */
/* ------------------------------------------------------------------ */

export const FUNDING_LABELS: Record<FundingType, string> = {
  "Gov / Multi-Uni": "Government program",
  "University Direct": "University scholarship",
  "Supervisor / RA-TA": "Professor-funded (RA/TA)",
};

export const FUNDING_HELP: Record<FundingType, string> = {
  "Gov / Multi-Uni":
    "Paid by a government or a group of universities. You usually apply once to the program and can study at one of several partner universities.",
  "University Direct":
    "Offered by one university. Applying for admission usually considers you for the scholarship too.",
  "Supervisor / RA-TA":
    "Funded from a professor's research grant as a Research Assistant (RA) or by the department as a Teaching Assistant (TA). Finding a willing supervisor is the key step.",
};

export const SUPERVISOR_LABELS: Record<SupervisorRequirement, string> = {
  "Mandatory Before Applying": "Supervisor required first",
  "Optional / Recommended": "Supervisor recommended",
  "Not Required (Central Admission)": "No supervisor needed",
};

export const JARGON = {
  leftEachMonth:
    "Stipend minus the estimated cost of living in that city. A positive number is roughly what you could save each month.",
  estimated:
    "The organisers have not announced this date yet. It is based on last year's calendar.",
  eligible:
    "Based on your profile: CGPA, IELTS, degree level and the minimum savings you set. Always confirm on the official site.",
};

/* ------------------------------------------------------------------ */
/* InfoTip: accessible click/hover explanation                         */
/* ------------------------------------------------------------------ */

export const InfoTip: React.FC<{ text: string; label?: string; className?: string }> = ({
  text,
  label = "What does this mean?",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <span ref={ref} className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="-m-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-500 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1/2 top-6 z-40 w-60 -translate-x-1/2 rounded-lg border border-stone-200 bg-white p-2.5 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-stone-700 shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* PageHeader: where am I, what is this, what next                     */
/* ------------------------------------------------------------------ */

export const PageHeader: React.FC<{
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  id?: string;
}> = ({ title, description, actions, id }) => (
  <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 id={id} className="font-serif text-2xl font-semibold text-stone-900 sm:text-[28px] sm:leading-tight">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-stone-600">{description}</p>
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </header>
);

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0";

export const btn = {
  primary: `${base} bg-stone-900 px-3.5 py-2 text-white hover:bg-stone-800`,
  secondary: `${base} border border-stone-300 bg-white px-3.5 py-2 text-stone-800 hover:bg-stone-50`,
  ghost: `${base} px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900`,
  link: "inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:text-blue-950 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded",
};

/* ------------------------------------------------------------------ */
/* useDialog: focus in, keep Tab inside, lock scroll, restore focus    */
/* ------------------------------------------------------------------ */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialog(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      const root = ref.current;
      if (!root) return;
      if (root.contains(document.activeElement)) return;
      const first = root.querySelector<HTMLElement>("[data-autofocus]") || root.querySelector<HTMLElement>(FOCUSABLE);
      (first || root).focus();
    };
    const t = window.setTimeout(focusFirst, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [open, ref]);
}

export { coverageItems, fundingLevel } from "../utils/listing";
