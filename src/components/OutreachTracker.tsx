"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Mail,
  Clock,
  MessageSquare,
  Send,
  PencilLine,
  XCircle,
  Search,
  UserRound,
  AlertCircle,
} from "lucide-react";
import {
  isFollowUpOverdue,
  OUTREACH_STATUSES,
  OutreachContact,
  OutreachStatus,
  useOutreach,
} from "../context/OutreachContext";
import { useScholarship } from "../context/ScholarshipContext";
import { ContactEditor } from "./ContactEditor";
import { formatVerifiedDate } from "../utils/scholarshipUtils";
import { PageHeader, btn } from "./ui";

export const STATUS_STYLES: Record<OutreachStatus, string> = {
  Drafting: "border-stone-300 bg-stone-50 text-stone-700",
  "Email Sent": "border-sky-200 bg-sky-50 text-sky-800",
  "Follow-up Due": "border-amber-200 bg-amber-50 text-amber-800",
  "Replied / Interview": "border-emerald-200 bg-emerald-50 text-emerald-800",
  Declined: "border-stone-200 bg-white text-stone-500",
};

const STATUS_ICONS: Record<OutreachStatus, React.ReactNode> = {
  Drafting: <PencilLine className="h-3.5 w-3.5" />,
  "Email Sent": <Send className="h-3.5 w-3.5" />,
  "Follow-up Due": <Clock className="h-3.5 w-3.5" />,
  "Replied / Interview": <MessageSquare className="h-3.5 w-3.5" />,
  Declined: <XCircle className="h-3.5 w-3.5" />,
};

type Filter = "All" | OutreachStatus;

const SHORT_LABELS: Record<OutreachStatus, string> = {
  Drafting: "Drafting",
  "Email Sent": "Sent",
  "Follow-up Due": "Follow-up",
  "Replied / Interview": "Replied",
  Declined: "Declined",
};

export const OutreachTracker: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const { contacts, isLoaded } = useOutreach();
  const { setActiveView } = useScholarship();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(OUTREACH_STATUSES.map((s) => [s, 0])) as Record<OutreachStatus, number>;
    contacts.forEach((c) => (byStatus[c.status] += 1));
    const contacted = contacts.filter((c) => c.status !== "Drafting").length;
    const replied = byStatus["Replied / Interview"];
    const overdue = contacts.filter(isFollowUpOverdue).length;
    return {
      byStatus,
      total: contacts.length,
      contacted,
      replied,
      overdue,
      responseRate: contacted > 0 ? Math.round((replied / contacted) * 100) : 0,
    };
  }, [contacts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => filter === "All" || c.status === filter)
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.institution.toLowerCase().includes(q) ||
          c.researchTopic.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const ao = isFollowUpOverdue(a) ? 0 : 1;
        const bo = isFollowUpOverdue(b) ? 0 : 1;
        return ao - bo || b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [contacts, filter, query]);

  const editing = contacts.find((c) => c.id === editingId) || null;

  return (
    <section aria-labelledby="outreach-title" className="space-y-5">
      {embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="outreach-title" className="text-sm text-stone-600">Professors you plan to email. Marking an email as sent reminds you to follow up after 10 days.</h2>
          <button type="button" className={btn.primary} onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" /> Add contact
          </button>
        </div>
      ) : (
      <PageHeader
        id="outreach-title"
        title="My outreach"
        description="Every professor you plan to email, in one place. Open a contact to draft the email, mark it as sent, and we will remind you to follow up after 10 days."
        actions={
          <>
            <button type="button" className={btn.secondary} onClick={() => setActiveView("supervisors")}>
              Find supervisors
            </button>
            <button type="button" className={btn.primary} onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4" /> Add contact
            </button>
          </>
        }
      />
      )}

      {/* Summary */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-stone-200 bg-stone-200 sm:grid-cols-4">
        <SummaryCell label="Contacts" value={stats.total} />
        <SummaryCell label="Emails sent" value={stats.contacted} />
        <SummaryCell label="Response rate" value={`${stats.responseRate}%`} hint={`${stats.replied} replied`} />
        <SummaryCell
          label="Follow-ups due"
          value={stats.overdue}
          tone={stats.overdue > 0 ? "warn" : undefined}
        />
      </dl>

      {/* Pipeline */}
      <div className="rounded-xl border border-stone-200 bg-white p-3 sm:p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Pipeline</p>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {OUTREACH_STATUSES.map((s) => {
            const count = stats.byStatus[s];
            const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(filter === s ? "All" : s)}
                className={`rounded-lg border p-2 text-left transition ${
                  filter === s ? "border-stone-900" : "border-stone-200 hover:border-stone-300"
                }`}
                aria-pressed={filter === s}
              >
                <span className="block font-mono text-base font-semibold text-stone-900">{count}</span>
                <span className="block truncate text-[10px] leading-tight text-stone-500 sm:hidden">{SHORT_LABELS[s]}</span>
                <span className="hidden truncate text-[11px] leading-tight text-stone-500 sm:block">{s}</span>
                <span className="mt-1.5 block h-1 rounded-full bg-stone-100">
                  <span className="block h-1 rounded-full bg-stone-800" style={{ width: `${pct}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-3.5 flex gap-1.5 overflow-x-auto px-3.5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["All", ...OUTREACH_STATUSES] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === f
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts"
            aria-label="Search contacts"
            className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pl-9 pr-3 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
          />
        </div>
      </div>

      {/* List */}
      {!isLoaded ? (
        <div className="h-24 animate-pulse rounded-xl border border-stone-200 bg-white" aria-hidden="true" />
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <Mail className="mx-auto h-6 w-6 text-stone-400" />
          <p className="mt-2 text-sm font-medium text-stone-800">No contacts yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-stone-500">
            Save researchers from Find Supervisors, or add a professor you already know about.
          </p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setActiveView("supervisors")}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50"
            >
              Find supervisors
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
            >
              Add contact
            </button>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
          No contacts match this filter.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {visible.map((c) => (
            <ContactRow key={c.id} contact={c} onOpen={() => setEditingId(c.id)} />
          ))}
        </ul>
      )}

      {(editing || isCreating) && (
        <ContactEditor
          contact={editing}
          onClose={() => {
            setEditingId(null);
            setIsCreating(false);
          }}
          onCreated={(id) => {
            setIsCreating(false);
            setEditingId(id);
          }}
        />
      )}
    </section>
  );
};

const SummaryCell: React.FC<{
  label: string;
  value: number | string;
  hint?: string;
  tone?: "warn";
}> = ({ label, value, hint, tone }) => (
  <div className="bg-white p-3 sm:p-4">
    <dt className="text-xs text-stone-500">{label}</dt>
    <dd className={`mt-1 font-mono text-xl font-semibold ${tone === "warn" ? "text-amber-700" : "text-stone-900"}`}>
      {value}
    </dd>
    {hint && <p className="text-[11px] text-stone-500">{hint}</p>}
  </div>
);

const ContactRow: React.FC<{ contact: OutreachContact; onOpen: () => void }> = ({ contact: c, onOpen }) => {
  const overdue = isFollowUpOverdue(c);
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col gap-2 p-3 text-left transition hover:bg-stone-50 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">{c.name}</p>
            <p className="truncate text-xs text-stone-500">
              {c.institution}
              {c.researchTopic ? ` · ${c.researchTopic}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pl-11 sm:pl-0">
          <span className="text-xs text-stone-500">
            {overdue ? (
              <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                <AlertCircle className="h-3.5 w-3.5" /> Follow up now
              </span>
            ) : c.followUpOn && (c.status === "Email Sent" || c.status === "Follow-up Due") ? (
              `Follow up ${formatVerifiedDate(c.followUpOn)}`
            ) : c.lastContactedOn ? (
              `Emailed ${formatVerifiedDate(c.lastContactedOn)}`
            ) : (
              ""
            )}
          </span>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[c.status]}`}
          >
            {STATUS_ICONS[c.status]}
            {c.status}
          </span>
        </div>
      </button>
    </li>
  );
};
