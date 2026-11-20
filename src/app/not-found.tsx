import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <p className="text-sm font-medium text-stone-500">Page not found</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-sm text-sm text-stone-600">
        The link may be old or mistyped. You can go back to browsing scholarships.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Back to ScholarTrack
      </Link>
    </main>
  );
}
