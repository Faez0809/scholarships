"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import { ALUMNI_LIMITS, Alumnus, profileLabel, programKey } from "../lib/alumni";
import { LISTED_ALUMNI } from "../data/alumni";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

/** How many people show before "Show all"; keeps the panel calm. */
const PREVIEW = 5;

const linkClass = "text-blue-800 underline-offset-2 hover:underline";

/**
 * "Bangladeshi scholars you can contact" for one program.
 * Shows listed alumni (each with its evidence link) plus approved self-added ones,
 * minus anyone who asked to be removed.
 */
export const AlumniSection: React.FC<{ scholarshipId: string; university: string; className?: string }> = ({
  scholarshipId,
  university,
  className,
}) => {
  const program = programKey(scholarshipId);
  const [extra, setExtra] = useState<{ added: Alumnus[]; removed: string[] }>({ added: [], removed: [] });
  const [form, setForm] = useState<"none" | "add" | "remove">("none");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/alumni?program=${encodeURIComponent(program)}`)
      .then((r) => (r.ok ? r.json() : { added: [], removed: [] }))
      .then((d) => {
        if (!cancelled) setExtra({ added: Array.isArray(d.added) ? d.added : [], removed: Array.isArray(d.removed) ? d.removed : [] });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [program]);

  const people = useMemo(() => {
    const removed = new Set(extra.removed);
    return [...LISTED_ALUMNI.filter((a) => a.program === program), ...extra.added].filter((a) => !removed.has(a.id));
  }, [program, extra]);

  return (
    <section aria-labelledby={`alumni-${program}`} className={className}>
      <h3 id={`alumni-${program}`} className="text-sm font-semibold text-stone-900">
        Bangladeshi scholars you can contact
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">
        Listed only when a public page shows they are Bangladeshi, at the university, and hold this scholarship.
      </p>

      {people.length === 0 ? (
        <p className="mt-3 text-sm text-stone-600">No verified Bangladeshi scholars listed for this program yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-stone-100 border-y border-stone-100">
          {(showAll ? people : people.slice(0, PREVIEW)).map((a) => (
            <li key={a.id} className="py-3">
              <p className="text-sm font-medium text-stone-900">{a.name}</p>
              <p className="mt-0.5 text-xs text-stone-600">
                {a.detail ? `${a.detail} · ` : ""}
                {a.university}
              </p>
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {a.profileUrl && (
                  <a href={a.profileUrl} target="_blank" rel="noopener noreferrer nofollow" className={`font-medium ${linkClass}`}>
                    {profileLabel(a.profileUrl)}
                  </a>
                )}
                <a href={a.evidenceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline">
                  Verified via {a.evidenceLabel}
                </a>
                {a.extraEvidenceUrl && (
                  <a href={a.extraEvidenceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline">
                    and {a.extraEvidenceLabel || "a second source"}
                  </a>
                )}
              </p>
              {!a.profileUrl && <p className="mt-1 text-xs text-stone-500">No public contact link found; the source page may list one.</p>}
            </li>
          ))}
        </ul>
      )}
      {!showAll && people.length > PREVIEW && (
        <button type="button" onClick={() => setShowAll(true)} className={`mt-2 text-xs font-medium ${linkClass}`}>
          Show all {people.length}
        </button>
      )}

      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
        <button type="button" onClick={() => setForm(form === "add" ? "none" : "add")} aria-expanded={form === "add"} className={linkClass}>
          Add yourself or someone you know
        </button>
        {people.length > 0 && (
          <button type="button" onClick={() => setForm(form === "remove" ? "none" : "remove")} aria-expanded={form === "remove"} className="underline-offset-2 hover:text-stone-800 hover:underline">
            Ask to be removed
          </button>
        )}
      </p>
      {people.length > 0 && <p className="mt-1 text-xs text-stone-500">Be brief and polite when you write; they are volunteering their time.</p>}

      {form === "add" && <AddForm scholarshipId={scholarshipId} university={university} onClose={() => setForm("none")} />}
      {form === "remove" && <RemoveForm scholarshipId={scholarshipId} people={people} onClose={() => setForm("none")} />}
    </section>
  );
};

function useSubmit(onDone: () => void) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const send = async (body: Record<string, unknown>) => {
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/alumni", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "We couldn't send this. Please try again later.");
      setState("sent");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send this.");
      setState("idle");
    }
  };
  return { state, error, setError, send };
}

const Sent: React.FC<{ text: string; onClose: () => void }> = ({ text, onClose }) => (
  <div className="mt-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700" role="status">
    {text}{" "}
    <button type="button" onClick={onClose} className="text-stone-500 hover:text-stone-800 hover:underline">
      Close
    </button>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-stone-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
  </label>
);

const Honeypot: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const id = useId();
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={`${id}-website`}>Website</label>
      <input id={`${id}-website`} type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

const AddForm: React.FC<{ scholarshipId: string; university: string; onClose: () => void }> = ({ scholarshipId, university, onClose }) => {
  const [v, setV] = useState({ name: "", university, detail: "", profileUrl: "", evidenceUrl: "", note: "", contact: "" });
  const [confirm, setConfirm] = useState(false);
  const [website, setWebsite] = useState("");
  const { state, error, setError, send } = useSubmit(() => {});
  const set = (k: keyof typeof v, max: number) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((old) => ({ ...old, [k]: e.target.value.slice(0, max) }));

  if (state === "sent") return <Sent text="Thanks. We'll check the evidence page before listing them." onClose={onClose} />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirm) return setError("Please confirm the two points above the button.");
        send({ kind: "add", scholarshipId, ...v, confirm, website });
      }}
      className="relative mt-2 space-y-3 rounded-lg border border-stone-200 bg-white p-3 text-sm"
      aria-label="Add a Bangladeshi scholar"
    >
      <Field label="Full name">
        <input required value={v.name} onChange={set("name", ALUMNI_LIMITS.name)} className={inputClass} autoComplete="name" />
      </Field>
      <Field label="University">
        <input required value={v.university} onChange={set("university", ALUMNI_LIMITS.university)} className={inputClass} />
      </Field>
      <Field label="Degree and year (optional)">
        <input value={v.detail} onChange={set("detail", ALUMNI_LIMITS.detail)} placeholder="e.g. PhD in Physics, 2024 intake" className={inputClass} />
      </Field>
      <Field label="Public profile to contact them">
        <input required type="url" inputMode="url" value={v.profileUrl} onChange={set("profileUrl", ALUMNI_LIMITS.url)} placeholder="LinkedIn, Facebook or a website" className={inputClass} />
      </Field>
      <Field label="Proof page" hint="A public page that names them with this scholarship at this university, such as a scholar profile, a university page or a news story.">
        <input required type="url" inputMode="url" value={v.evidenceUrl} onChange={set("evidenceUrl", ALUMNI_LIMITS.url)} placeholder="https://" className={inputClass} />
      </Field>
      <Field label="Your email (optional)">
        <input type="email" value={v.contact} onChange={set("contact", ALUMNI_LIMITS.contact)} placeholder="Only if we need to ask something" autoComplete="email" className={inputClass} />
      </Field>
      <label className="flex items-start gap-2 text-xs text-stone-700">
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-stone-300" />
        <span>They are Bangladeshi, and they agreed to be listed with this profile link.</span>
      </label>
      <Honeypot value={website} onChange={setWebsite} />
      {error && (
        <p className="text-sm text-amber-800" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={state === "sending"} className="rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Send for review"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-stone-500 hover:text-stone-800">
          Cancel
        </button>
      </div>
    </form>
  );
};

const RemoveForm: React.FC<{ scholarshipId: string; people: Alumnus[]; onClose: () => void }> = ({ scholarshipId, people, onClose }) => {
  const [targetId, setTargetId] = useState(people[0]?.id || "");
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const { state, error, send } = useSubmit(() => {});

  if (state === "sent") return <Sent text="Thanks. We'll take the listing down once we've checked the request." onClose={onClose} />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send({ kind: "remove", scholarshipId, targetId, note, contact, website });
      }}
      className="relative mt-2 space-y-3 rounded-lg border border-stone-200 bg-white p-3 text-sm"
      aria-label="Ask to be removed"
    >
      <Field label="Who should be removed?">
        <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={inputClass}>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Your name and reason">
        <textarea required rows={2} value={note} onChange={(e) => setNote(e.target.value.slice(0, ALUMNI_LIMITS.note))} placeholder="e.g. This is me and I'd rather not be listed." className={inputClass} />
      </Field>
      <Field label="Your email (optional)">
        <input type="email" value={contact} onChange={(e) => setContact(e.target.value.slice(0, ALUMNI_LIMITS.contact))} autoComplete="email" className={inputClass} />
      </Field>
      <Honeypot value={website} onChange={setWebsite} />
      {error && (
        <p className="text-sm text-amber-800" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={state === "sending"} className="rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Send request"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-stone-500 hover:text-stone-800">
          Cancel
        </button>
      </div>
    </form>
  );
};
