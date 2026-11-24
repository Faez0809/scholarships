"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { ErrorReport } from "../lib/errorReports";
import { useDialog } from "./ui";

async function fetchOpenReports(pin: string): Promise<{ reports: ErrorReport[]; error: string }> {
  try {
    const res = await fetch("/api/error-reports", { headers: { "x-admin-pin": pin }, cache: "no-store" });
    const data = await res.json();
    if (!res.ok) return { reports: [], error: data.error || "Could not load reports." };
    return { reports: data.reports || [], error: "" };
  } catch {
    return { reports: [], error: "Could not load reports." };
  }
}

/** Admin: open reports from visitors, with Mark fixed and Dismiss. */
export const ErrorReportsDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { adminPin, scholarships, setSelectedScholarship } = useScholarship();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(open, ref);
  const [reports, setReports] = useState<ErrorReport[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    fetchOpenReports(adminPin).then(({ reports: list, error: err }) => {
      if (cancelled) return;
      setReports(list);
      setError(err);
    });
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, adminPin, onClose]);

  const resolve = async (id: string, status: "fixed" | "dismissed") => {
    setBusyId(id);
    try {
      const res = await fetch("/api/error-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update the report.");
      setReports((r) => (r || []).filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the report.");
    } finally {
      setBusyId(null);
    }
  };

  if (!open) return null;
  const nameOf = (id: string) => scholarships.find((s) => s.id === id)?.name || id;

  return createPortal(
    <div className="st-backdrop fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reports-title"
        onClick={(e) => e.stopPropagation()}
        className="st-dialog flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 id="reports-title" className="font-serif text-lg font-semibold text-stone-900">
            Error reports
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100" aria-label="Close error reports">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3">
          {error && <p className="mb-3 text-sm text-amber-800">{error}</p>}
          {reports === null ? (
            <p className="text-sm text-stone-500">Loading…</p>
          ) : reports.length === 0 ? (
            !error && <p className="text-sm text-stone-500">No open reports.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {reports.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const s = scholarships.find((x) => x.id === r.scholarship_id);
                        if (s) {
                          onClose();
                          setSelectedScholarship(s);
                        }
                      }}
                      className="min-w-0 text-left text-sm font-medium text-stone-900 hover:text-blue-800"
                    >
                      {nameOf(r.scholarship_id)}
                    </button>
                    <span className="shrink-0 text-xs text-stone-500">{new Date(r.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-stone-600">{r.field}</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-stone-700">{r.message}</p>
                  {r.contact && <p className="mt-1 break-all text-xs text-stone-500">Reply to: {r.contact}</p>}
                  <div className="mt-2 flex gap-4 text-sm">
                    <button type="button" disabled={busyId === r.id} onClick={() => resolve(r.id, "fixed")} className="font-medium text-blue-800 hover:underline disabled:opacity-50">
                      Mark fixed
                    </button>
                    <button type="button" disabled={busyId === r.id} onClick={() => resolve(r.id, "dismissed")} className="text-stone-500 hover:text-stone-800 disabled:opacity-50">
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
