"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { AlumniRequest } from "../lib/alumni";
import { LISTED_ALUMNI } from "../data/alumni";
import { useDialog } from "./ui";

/** Admin: alumni add and remove requests. Approve only after opening the proof page. */
export const AlumniRequestsDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { adminPin, scholarships } = useScholarship();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(open, ref);
  const [items, setItems] = useState<AlumniRequest[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    fetch("/api/alumni-requests", { headers: { "x-admin-pin": adminPin }, cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setItems([]);
          setError(data.error || "Could not load requests.");
        } else {
          setItems(data.requests || []);
          setError("");
        }
      })
      .catch(() => !cancelled && (setItems([]), setError("Could not load requests.")));
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, adminPin, onClose]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    try {
      const res = await fetch("/api/alumni-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update the request.");
      setItems((r) => (r || []).filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the request.");
    } finally {
      setBusyId(null);
    }
  };

  if (!open) return null;
  const programName = (id: string) => scholarships.find((s) => s.id === id)?.name || id;
  const targetName = (id: string | null) => (id && LISTED_ALUMNI.find((a) => a.id === id)?.name) || id || "";
  const ext = "break-all text-blue-800 hover:underline";

  return createPortal(
    <div className="st-backdrop fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alumni-requests-title"
        onClick={(e) => e.stopPropagation()}
        className="st-dialog flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 id="alumni-requests-title" className="font-serif text-lg font-semibold text-stone-900">
            Alumni requests
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100" aria-label="Close alumni requests">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3">
          <p className="mb-3 text-xs text-stone-500">
            Approve an addition only when the proof page shows they are Bangladeshi, at that university, and hold the scholarship.
          </p>
          {error && <p className="mb-3 text-sm text-amber-800">{error}</p>}
          {items === null ? (
            <p className="text-sm text-stone-500">Loading…</p>
          ) : items.length === 0 ? (
            !error && <p className="text-sm text-stone-500">No pending requests.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {items.map((r) => (
                <li key={r.id} className="py-3 text-sm">
                  <p className="text-xs font-medium text-stone-500">
                    {r.kind === "add" ? "Add" : "Remove"} · {programName(r.scholarship_id)}
                  </p>
                  {r.kind === "add" ? (
                    <>
                      <p className="mt-1 font-medium text-stone-900">{r.name}</p>
                      <p className="text-xs text-stone-600">
                        {r.detail ? `${r.detail} · ` : ""}
                        {r.university}
                      </p>
                      {r.profile_url && (
                        <p className="mt-1 text-xs">
                          Profile:{" "}
                          <a href={r.profile_url} target="_blank" rel="noopener noreferrer" className={ext}>
                            {r.profile_url}
                          </a>
                        </p>
                      )}
                      {r.evidence_url && (
                        <p className="mt-0.5 text-xs">
                          Proof:{" "}
                          <a href={r.evidence_url} target="_blank" rel="noopener noreferrer" className={ext}>
                            {r.evidence_url}
                          </a>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 font-medium text-stone-900">{targetName(r.target_id)}</p>
                  )}
                  {r.note && <p className="mt-1 whitespace-pre-wrap break-words text-stone-700">{r.note}</p>}
                  {r.contact && <p className="mt-1 break-all text-xs text-stone-500">Reply to: {r.contact}</p>}
                  <div className="mt-2 flex gap-4">
                    <button type="button" disabled={busyId === r.id} onClick={() => decide(r.id, "approved")} className="font-medium text-blue-800 hover:underline disabled:opacity-50">
                      {r.kind === "add" ? "Approve and list" : "Remove from site"}
                    </button>
                    <button type="button" disabled={busyId === r.id} onClick={() => decide(r.id, "rejected")} className="text-stone-500 hover:text-stone-800 disabled:opacity-50">
                      Reject
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
