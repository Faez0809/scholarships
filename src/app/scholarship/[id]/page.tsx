import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getScholarshipById } from "@/lib/getScholarship";
import { cgpaLabel, coverageItems, fundingLevel, ieltsLabel, lastCheckedLabel, listingStatus, stipendLabel } from "@/utils/listing";
import { ReportErrorLink } from "@/components/ReportError";
import { formatSignedUSD, getSavingsRange } from "@/utils/scholarshipUtils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = await getScholarshipById(id);
  if (!s) return { title: "Scholarship not found · ScholarTrack" };
  const status = listingStatus(s).text;
  const description = `${s.university}, ${s.country}. ${s.degrees.join(" & ")}. ${fundingLevel(s)}, ${s.stipendAmountUnknown ? "stipend amount not published" : `stipend about $${s.monthlyStipendUSD.toLocaleString("en-US")}/month`}. ${status}.`;
  return {
    title: `${s.name} · ScholarTrack`,
    description,
    openGraph: {
      title: s.name,
      description,
      type: "article",
      siteName: "ScholarTrack",
      url: `/scholarship/${s.id}`,
    },
    twitter: { card: "summary", title: s.name, description },
  };
}

export default async function ScholarshipPage({ params }: Props) {
  const { id } = await params;
  const s = await getScholarshipById(id);
  if (!s) notFound();

  const status = listingStatus(s);
  const { minSavings, maxSavings, isMultiUni, unknown: stipendUnknown } = getSavingsRange(s);
  const money =
    isMultiUni && minSavings !== maxSavings
      ? `${formatSignedUSD(minSavings)} to ${formatSignedUSD(maxSavings)}`
      : formatSignedUSD(maxSavings);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:py-12">
      <article className="mx-auto max-w-2xl rounded-xl border border-stone-200 bg-white p-5 sm:p-8">
        <p className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-900">
            ScholarTrack
          </Link>{" "}
          · Scholarship
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-stone-900">{s.name}</h1>
        <p className="mt-2 text-stone-700">
          {s.university} · {s.city}, {s.country}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {s.degrees.join(" & ")} ·{" "}
          <span className={fundingLevel(s) === "Fully funded" ? "text-emerald-800" : "text-amber-800"}>{fundingLevel(s)}</span>
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-y border-stone-100 py-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-stone-500">Deadline</dt>
            <dd className={`mt-0.5 text-sm font-medium ${status.className}`}>{status.text}</dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">Stipend</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums text-stone-900">
              {stipendLabel(s)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">Left after living costs</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums text-stone-900">{stipendUnknown ? "Unknown" : `${money}/mo`}</dd>
          </div>
        </dl>

        <h2 className="mt-6 text-sm font-semibold text-stone-900">What the funding covers</h2>
        <ul className="mt-2 grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-3">
          {coverageItems(s).map((c) => (
            <li key={c.label} className={c.covered ? "text-stone-800" : "text-stone-500 line-through decoration-stone-300"}>
              {c.covered ? "✓" : "–"} {c.label}
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-sm font-semibold text-stone-900">Requirements</h2>
        <p className="mt-1 text-sm text-stone-700">
          Minimum CGPA: {cgpaLabel(s).toLowerCase()} · IELTS: {ieltsLabel(s).toLowerCase()} · {s.medium === "English Only" ? "Taught in English" : "Various languages"}
        </p>
        {s.requirementsNote && <p className="mt-1 text-sm text-stone-600">{s.requirementsNote}</p>}

        <h2 className="mt-6 text-sm font-semibold text-stone-900">About this program</h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-700">{s.overview}</p>
        {s.deadlineNote && <p className="mt-3 text-sm text-stone-600">{s.deadlineNote}</p>}

        <div className="mt-6 text-xs text-stone-500">
          {lastCheckedLabel(s)}. Always confirm details on the official page before applying.{" "}
          <ReportErrorLink scholarshipId={s.id} />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href={s.officialWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
          >
            Official page
          </a>
          <Link
            href={`/?s=${encodeURIComponent(s.id)}`}
            className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Open in ScholarTrack: eligibility, documents and next steps
          </Link>
        </div>
      </article>
    </main>
  );
}
