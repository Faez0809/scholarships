"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Trash2, Copy, Check, Mail, ExternalLink } from "lucide-react";
import {
  OUTREACH_STATUSES,
  OutreachContact,
  OutreachStatus,
  SenderDetails,
  useOutreach,
} from "../context/OutreachContext";
import { useScholarship } from "../context/ScholarshipContext";
import { buildEmail, TEMPLATE_LABELS, TemplateKind } from "../utils/outreachTemplates";
import { formatVerifiedDate } from "../utils/scholarshipUtils";
import { useDialog } from "./ui";

type Tab = "details" | "email" | "history";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900";

export const ContactEditor: React.FC<{
  contact: OutreachContact | null;
  onClose: () => void;
  onCreated: (id: string) => void;
}> = ({ contact, onClose, onCreated }) => {
  const { addContact, updateContact, setStatus, removeContact } = useOutreach();
  const isNew = !contact;
  const [tab, setTab] = useState<Tab>("details");
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(true, panelRef);

  // Draft fields (details tab)
  const [name, setName] = useState(contact?.name || "");
  const [institution, setInstitution] = useState(contact?.institution || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [profileUrl, setProfileUrl] = useState(contact?.profileUrl || "");
  const [researchTopic, setResearchTopic] = useState(contact?.researchTopic || "");
  const [paperTitle, setPaperTitle] = useState(contact?.paperTitle || "");
  const [notes, setNotes] = useState(contact?.notes || "");
  const [followUpOn, setFollowUpOn] = useState(contact?.followUpOn || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = () => {
    if (!name.trim() || !institution.trim()) {
      setError("Name and university are required.");
      return;
    }
    setError(null);
    const fields = { name, institution, email, profileUrl, researchTopic, paperTitle, notes, followUpOn };
    if (isNew) {
      const created = addContact(fields);
      onCreated(created.id);
    } else {
      updateContact(contact.id, {
        ...fields,
        name: name.trim(),
        institution: institution.trim(),
        email: email.trim(),
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (!contact) return;
    if (window.confirm(`Remove ${contact.name} from your outreach list? This cannot be undone.`)) {
      removeContact(contact.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="contact-editor-title">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div ref={panelRef} className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-6">
          <h2 id="contact-editor-title" className="truncate text-base font-semibold text-zinc-900">
            {isNew ? "Add contact" : contact.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isNew && (
          <div className="border-b border-zinc-200 px-4 sm:px-6">
            <div className="-mb-px flex gap-5" role="tablist">
              {(["details", "email", "history"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`border-b-2 py-2.5 text-sm font-medium capitalize ${
                    tab === t ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {t === "email" ? "Email draft" : t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {!isNew && tab === "email" && <EmailPanel contact={contact} />}
          {!isNew && tab === "history" && <HistoryPanel contact={contact} />}
          {(isNew || tab === "details") && (
            <div className="space-y-4">
              {!isNew && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-zinc-700">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {OUTREACH_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setStatus(contact.id, s as OutreachStatus);
                        }}
                        aria-pressed={contact.status === s}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                          contact.status === s
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-500">
                    Marking an email as sent sets a follow-up reminder 10 days later.
                  </p>
                </div>
              )}

              <Field label="Name" required>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Prof. Jane Doe" />
              </Field>
              <Field label="University" required>
                <input className={inputClass} value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="University of Toronto" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email">
                  <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@university.edu" />
                </Field>
                <Field label="Follow up by">
                  <input className={inputClass} type="date" value={followUpOn} onChange={(e) => setFollowUpOn(e.target.value)} />
                </Field>
              </div>
              <Field label="Profile link">
                <input className={inputClass} type="url" value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="Faculty page, ORCID or Google Scholar" />
              </Field>
              <Field label="Research topic">
                <input className={inputClass} value={researchTopic} onChange={(e) => setResearchTopic(e.target.value)} placeholder="e.g. medical image segmentation" />
              </Field>
              <Field label="Paper to mention">
                <input className={inputClass} value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} placeholder="Title of one of their recent papers" />
              </Field>
              <Field label="Notes">
                <textarea className={`${inputClass} min-h-24`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lab size, funding, what they replied, next steps..." />
              </Field>
              {profileUrl && /^https?:\/\//.test(profileUrl) && (
                <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-zinc-700 underline underline-offset-2">
                  <ExternalLink className="h-3 w-3" /> Open profile
                </a>
              )}
              {error && <p className="text-sm text-red-700">{error}</p>}
            </div>
          )}
        </div>

        {(isNew || tab === "details") && (
          <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3 sm:px-6">
            {!isNew ? (
              <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-zinc-800">
                {isNew ? "Add contact" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-zinc-700">
      {label}
      {required && <span className="text-zinc-400"> (required)</span>}
    </span>
    {children}
  </label>
);

const EmailPanel: React.FC<{ contact: OutreachContact }> = ({ contact }) => {
  const { sender, setSender, setStatus } = useOutreach();
  const { profile } = useScholarship();
  const [kind, setKind] = useState<TemplateKind>(
    contact.status === "Email Sent" || contact.status === "Follow-up Due"
      ? "follow_up"
      : contact.status === "Replied / Interview"
      ? "thank_you"
      : "initial"
  );
  const generated = useMemo(() => buildEmail(kind, contact, sender, profile), [kind, contact, sender, profile]);
  const [subject, setSubject] = useState(generated.subject);
  const [body, setBody] = useState(generated.body);
  const [copied, setCopied] = useState(false);
  const [editingSender, setEditingSender] = useState(!sender.fullName);

  // Regenerate when the template inputs change
  const [shownDraft, setShownDraft] = useState(generated);
  if (shownDraft !== generated) {
    setShownDraft(generated);
    setSubject(generated.subject);
    setBody(generated.body);
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const mailto = contact.email
    ? `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null;

  return (
    <div className="space-y-4">
      <SenderForm sender={sender} onSave={setSender} open={editingSender} setOpen={setEditingSender} />

      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-700">Template</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(TEMPLATE_LABELS) as TemplateKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                kind === k ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              }`}
            >
              {TEMPLATE_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-700">Subject</span>
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-700">Message</span>
        <textarea className={`${inputClass} min-h-80 font-[inherit] leading-relaxed`} value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <p className="text-[11px] text-zinc-500">
        Replace anything in [brackets] and personalise at least one sentence before sending.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={copy} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy email"}
        </button>
        {mailto ? (
          <a href={mailto} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50">
            <Mail className="h-4 w-4" /> Open in email app
          </a>
        ) : (
          <span className="self-center text-xs text-zinc-500">Add an email address in Details to open it in your email app.</span>
        )}
        {contact.status === "Drafting" && kind === "initial" && (
          <button
            type="button"
            onClick={() => setStatus(contact.id, "Email Sent")}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 sm:ml-auto"
          >
            Mark as sent
          </button>
        )}
      </div>
    </div>
  );
};

const SenderForm: React.FC<{
  sender: SenderDetails;
  onSave: (s: SenderDetails) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}> = ({ sender, onSave, open, setOpen }) => {
  const [draft, setDraft] = useState(sender);
  const [shownSender, setShownSender] = useState(sender);
  if (shownSender !== sender) {
    setShownSender(sender);
    setDraft(sender);
  }

  if (!open) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
        <span className="truncate">
          Signing as <span className="font-medium text-zinc-900">{sender.fullName}</span>
        </span>
        <button type="button" onClick={() => setOpen(true)} className="shrink-0 font-medium text-zinc-800 underline underline-offset-2">
          Edit my details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-medium text-zinc-800">Your details (used in every template, saved in this browser)</p>
      <input className={inputClass} placeholder="Full name" value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
      <input className={inputClass} placeholder="Current role, e.g. final-year BSc student in CSE at XYZ University" value={draft.currentRole} onChange={(e) => setDraft({ ...draft, currentRole: e.target.value })} />
      <input className={inputClass} placeholder="Research interest, e.g. efficient deep learning for medical imaging" value={draft.researchInterest} onChange={(e) => setDraft({ ...draft, researchInterest: e.target.value })} />
      <textarea className={`${inputClass} min-h-16`} placeholder="One or two highlights, e.g. a publication, thesis result or award" value={draft.highlights} onChange={(e) => setDraft({ ...draft, highlights: e.target.value })} />
      <div className="flex justify-end gap-2">
        {sender.fullName && (
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700">
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onSave(draft);
            setOpen(false);
          }}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          Save my details
        </button>
      </div>
    </div>
  );
};

const HistoryPanel: React.FC<{ contact: OutreachContact }> = ({ contact }) => (
  <ol className="relative space-y-4 border-l border-zinc-200 pl-4">
    {contact.history
      .slice()
      .reverse()
      .map((h, i) => (
        <li key={`${h.at}-${i}`} className="relative">
          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-zinc-400" />
          <p className="text-sm font-medium text-zinc-900">{h.status}</p>
          <p className="text-xs text-zinc-500">
            {formatVerifiedDate(h.at.slice(0, 10))}
            {h.note ? ` · ${h.note}` : ""}
          </p>
        </li>
      ))}
  </ol>
);
