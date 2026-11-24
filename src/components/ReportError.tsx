"use client";

import React, { useId, useState } from "react";
import { REPORT_CONTACT_MAX, REPORT_FIELDS, REPORT_MESSAGE_MAX, ReportField } from "../lib/errorReports";

/**
 * A quiet "Report an error" link that opens a small inline form.
 * Used next to the "Last checked" line on a listing.
 */
export const ReportErrorLink: React.FC<{ scholarshipId: string; className?: string }> = ({ scholarshipId, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline ${className || ""}`}
      >
        Report an error
      </button>
      {open && <ReportErrorForm scholarshipId={scholarshipId} onClose={() => setOpen(false)} />}
    </>
  );
};

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

const ReportErrorForm: React.FC<{ scholarshipId: string; onClose: () => void }> = ({ scholarshipId, onClose }) => {
  const id = useId();
  const [field, setField] = useState<ReportField>("Deadline");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please say what looks wrong.");
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scholarshipId, field, message, contact, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "We couldn't send your report. Please try again later.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send your report.");
      setState("idle");
    }
  };

  if (state === "sent") {
    return (
      <div className="mt-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700" role="status">
        Thanks, we&apos;ll check it against the official page.{" "}
        <button type="button" onClick={onClose} className="text-stone-500 hover:text-stone-800 hover:underline">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-2.5 rounded-lg border border-stone-200 bg-white p-3 text-sm" aria-label="Report an error">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-stone-700">What looks wrong?</span>
        <select value={field} onChange={(e) => setField(e.target.value as ReportField)} className={inputClass}>
          {REPORT_FIELDS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-stone-700">Details</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, REPORT_MESSAGE_MAX))}
          rows={3}
          required
          placeholder="e.g. The official page says the deadline is 15 January."
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-stone-700">Your email (optional)</span>
        <input
          type="email"
          value={contact}
          onChange={(e) => setContact(e.target.value.slice(0, REPORT_CONTACT_MAX))}
          placeholder="Only if you'd like a reply"
          autoComplete="email"
          className={inputClass}
        />
      </label>
      {/* Honeypot: hidden from people and screen readers */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {error && (
        <p className="text-sm text-amber-800" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send report"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-stone-500 hover:text-stone-800">
          Cancel
        </button>
      </div>
    </form>
  );
};
