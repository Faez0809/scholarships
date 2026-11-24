/** The public address of the site, used in links that leave the app (emails, share cards). */
export const DEFAULT_SITE_URL = "https://scholartrack.dpdns.org";

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return DEFAULT_SITE_URL;
}
