/**
 * Who can apply, for the nationalities ScholarTrack users most often hold.
 * "yes"   = citizens can apply (subject to the program's other rules)
 * "no"    = citizens cannot apply to this program
 * "check" = it depends on the cycle or could not be confirmed; check the official list
 *
 * Checked against public program information on 2026-11-20. Programs not listed here
 * (for example ones an admin adds) show "check".
 */

export const NATIONALITIES = [
  { code: "BD", label: "Bangladesh" },
  { code: "IN", label: "India" },
  { code: "PK", label: "Pakistan" },
  { code: "NP", label: "Nepal" },
  { code: "LK", label: "Sri Lanka" },
  { code: "OTHER", label: "Another country" },
] as const;

export type NationalityCode = (typeof NATIONALITIES)[number]["code"];
export type NationalityStatus = "yes" | "no" | "check";

const ALL_YES: Partial<Record<NationalityCode, NationalityStatus>> = { BD: "yes", IN: "yes", PK: "yes", NP: "yes", LK: "yes" };

const RULES: Record<string, { status: Partial<Record<NationalityCode, NationalityStatus>>; note?: string }> = {
  "csc-china-high-level-2026": { status: ALL_YES },
  "erasmus-mundus-emjm-2026": { status: ALL_YES },
  "daad-epos-germany-2026": { status: ALL_YES, note: "Open to citizens of developing countries on the OECD DAC list." },
  "waterloo-cs-eng-ra-ta-2026": { status: ALL_YES },
  "georgia-tech-gra-gta-2026": { status: ALL_YES },
  "melbourne-rtp-scholarship-2026": { status: ALL_YES },
  "kaust-fellowship-2026": { status: ALL_YES },
  "gates-cambridge-2026": { status: ALL_YES, note: "Open to all citizens of countries outside the UK." },
  "eth-zurich-esop-2026": { status: ALL_YES },
  "mext-japan-todai-2026": { status: ALL_YES },
  "kaist-global-fellowship-2026": { status: ALL_YES },
  "eiffel-excellence-2026": { status: ALL_YES },
  "stipendium-hungaricum-2027": {
    status: { BD: "yes", PK: "yes", IN: "check", NP: "check", LK: "check" },
    note: "Only nationals of current partner countries can apply; the list changes each year.",
  },
  "turkiye-burslari-2027": { status: ALL_YES },
  "fulbright-foreign-student-2028": { status: ALL_YES, note: "Apply through the Fulbright office or U.S. Embassy in your country." },
  "gks-graduate-korea-2027": { status: ALL_YES },
  "commonwealth-uk-2028": {
    status: { BD: "yes", PK: "yes", IN: "check", LK: "check", NP: "no" },
    note: "Only for Commonwealth countries on the current eligible list. Nepal is not a Commonwealth member.",
  },
  "swedish-institute-sisgp-2027": {
    status: { BD: "yes", IN: "check", PK: "check", NP: "check", LK: "check" },
    note: "Only about 34 countries are eligible each cycle; recent lists include Bangladesh.",
  },
  "swiss-government-excellence-2028": {
    status: { IN: "yes", PK: "yes", BD: "check", NP: "check", LK: "check" },
    note: "Offered to about 183 countries, each with its own quota and deadline.",
  },
  "canada-cgrs-doctoral-2027": {
    status: { BD: "no", IN: "no", PK: "no", NP: "no", LK: "no" },
    note: "Mainly for Canadian citizens and permanent residents.",
  },
  "australia-awards-2028": {
    status: { BD: "yes", PK: "yes", NP: "yes", IN: "check", LK: "check" },
    note: "Only citizens of participating countries can apply.",
  },
  "nl-scholarship-2027": { status: ALL_YES, note: "Open to students from outside the EEA." },
  "vlir-uos-icp-2027": {
    status: { BD: "check", IN: "check", PK: "check", NP: "check", LK: "check" },
    note: "Only nationals of the VLIR-UOS country list; check the current call.",
  },
  "taiwan-moe-icdf-2027": {
    status: { IN: "yes", BD: "check", PK: "check", NP: "check", LK: "check" },
    note: "MOE applications go through a Taipei office in your country; TaiwanICDF is for partner countries only.",
  },
  "singa-singapore-2027": { status: ALL_YES },
  "chevening-uk-2028": { status: ALL_YES, note: "Open to Chevening-eligible countries, which include all five." },
  "hkpfs-hong-kong-2027": { status: ALL_YES },
  "clarendon-oxford-2027": { status: ALL_YES },
  "rhodes-oxford-2028": { status: ALL_YES, note: "India and Pakistan have their own rounds; other countries apply through Rhodes Global." },
  "adb-jsp-2027": { status: ALL_YES, note: "For nationals of ADB borrowing member countries." },
  "jds-japan-2027": { status: { BD: "yes", PK: "yes", NP: "yes", LK: "yes", IN: "no" }, note: "Only for JDS partner countries; mainly government officials." },
  "daad-helmut-schmidt-2028": { status: ALL_YES, note: "For graduates from developing countries on the DAAD list." },
  "knight-hennessy-stanford-2028": { status: ALL_YES },
  "schwarzman-tsinghua-2028": { status: ALL_YES },
  "epfl-excellence-2027": { status: ALL_YES },
  "tu-delft-van-effen-2027": { status: ALL_YES },
  "monash-mgs-2027": { status: ALL_YES },
  "usyd-rtp-international-2027": { status: ALL_YES },
  "uq-graduate-school-2027": { status: ALL_YES },
  "hbku-qatar-2027": { status: ALL_YES },
  "oist-phd-japan-2028": { status: ALL_YES },
  "mbzuai-uae-2027": { status: ALL_YES },
  "nus-research-scholarship-2027": { status: ALL_YES },
  "yenching-pku-2027": { status: ALL_YES },
  "tigp-academia-sinica-2027": { status: ALL_YES },
  "daad-doctoral-germany-2028": { status: ALL_YES },
};

export function nationalityStatus(scholarshipId: string, code: string | undefined): NationalityStatus | null {
  if (!code || code === "OTHER") return null;
  const rule = RULES[scholarshipId];
  if (!rule) return "check";
  return rule.status[code as NationalityCode] || "check";
}

export function nationalityNote(scholarshipId: string): string | undefined {
  return RULES[scholarshipId]?.note;
}

export function nationalityLabel(code: string | undefined): string {
  return NATIONALITIES.find((n) => n.code === code)?.label || "";
}
