/**
 * University intro and freely licensed photos from Wikipedia and Wikimedia Commons.
 * Public APIs, no keys; requests go straight from the browser. Only images that
 * exist on the university's Wikipedia page are returned; nothing is invented.
 */

const WIKI = "https://en.wikipedia.org";

export interface UniversityPhoto {
  title: string;
  /** About 330px wide, for the strip. */
  thumbUrl: string;
  /** About 1280px wide, for the viewer. Never the original file, which can be huge. */
  largeUrl: string;
  width: number;
  height: number;
  author: string;
  license: string;
  sourceUrl: string;
}

export interface UniversityInfo {
  title: string;
  extract: string;
  pageUrl: string;
  photos: UniversityPhoto[];
}

const cache = new Map<string, Promise<UniversityInfo | null>>();

function stripHtml(s: string | undefined): string {
  if (!s) return "";
  const div = typeof document !== "undefined" ? document.createElement("div") : null;
  if (!div) return s.replace(/<[^>]+>/g, "");
  div.innerHTML = s;
  return (div.textContent || "").trim();
}

/** Clean names like "University of Toronto (UofT)" or "ETH Zurich & partners" for searching. */
export function cleanUniversityName(name: string): string {
  return name.replace(/\(.*?\)/g, "").split(/[&,;]/)[0].trim();
}

export async function searchUniversityTitles(query: string, signal?: AbortSignal): Promise<string[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = `${WIKI}/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&namespace=0&format=json&origin=*`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as [string, string[]];
  return data[1] || [];
}

const SKIP = /(logo|seal|crest|coat[_ ]of[_ ]arms|emblem|icon|flag|map|locator|signature|wordmark|symbol|diagram|chart|badge|\.svg$)/i;

async function loadInfo(name: string): Promise<UniversityInfo | null> {
  const query = cleanUniversityName(name);
  // 1. Resolve the best page title
  const search = await fetch(
    `${WIKI}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " university")}&srlimit=1&format=json&origin=*`
  );
  if (!search.ok) return null;
  const sj = await search.json();
  const title: string | undefined = sj?.query?.search?.[0]?.title;
  if (!title) return null;

  // 2. Summary
  const sumRes = await fetch(`${WIKI}/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  if (!sumRes.ok) return null;
  const summary = await sumRes.json();
  if (summary.type === "disambiguation") return null;

  // 3. Photos used on the page (Commons or local), with licence and author
  const imgRes = await fetch(
    `${WIKI}/w/api.php?action=query&titles=${encodeURIComponent(title)}&generator=images&gimlimit=50&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1280&format=json&origin=*`
  );
  let photos: UniversityPhoto[] = [];
  if (imgRes.ok) {
    const ij = await imgRes.json();
    const pages = Object.values(ij?.query?.pages || {}) as {
      title: string;
      imageinfo?: {
        url: string;
        thumburl: string;
        width: number;
        height: number;
        descriptionurl: string;
        extmetadata?: Record<string, { value: string }>;
      }[];
    }[];
    photos = pages
      .filter((p) => /\.(jpe?g|png|webp)$/i.test(p.title) && !SKIP.test(p.title) && p.imageinfo?.[0])
      .map((p) => {
        const info = p.imageinfo![0];
        const meta = info.extmetadata || {};
        return {
          title: p.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, "").replace(/_/g, " "),
          // Wikimedia only serves standard thumbnail widths (330, 960, 1280, ...); other widths fail.
          thumbUrl: info.width > 330 ? info.thumburl.replace(/\/\d+px-/, "/330px-") : info.thumburl,
          largeUrl: info.thumburl,
          width: info.width,
          height: info.height,
          author: stripHtml(meta.Artist?.value) || "Unknown author",
          license: stripHtml(meta.LicenseShortName?.value) || "See source",
          sourceUrl: info.descriptionurl,
        };
      })
      // Landscape photos of reasonable size are usually campus shots, not portraits or documents
      .filter((p) => p.width >= 600 && p.width >= p.height * 1.15)
      .slice(0, 8);
  }

  return {
    title: summary.title || title,
    extract: summary.extract || "",
    pageUrl: summary.content_urls?.desktop?.page || `${WIKI}/wiki/${encodeURIComponent(title)}`,
    photos,
  };
}

export function getUniversityInfo(name: string): Promise<UniversityInfo | null> {
  const key = cleanUniversityName(name).toLowerCase();
  if (!cache.has(key)) {
    cache.set(
      key,
      loadInfo(name).catch(() => {
        cache.delete(key);
        return null;
      })
    );
  }
  return cache.get(key)!;
}
