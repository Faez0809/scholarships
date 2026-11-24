import { Scholarship } from "../types/scholarship";

/**
 * The stipend as each program states it, in its own currency and period, for cards and
 * summaries. Taken from the stipend notes on each listing (official or clearly flagged as
 * reported). Programs that publish no amount are not listed; they show
 * "Stipend amount not published" instead.
 */
export const STIPEND_DISPLAY: Record<string, string> = {
  "csc-china-high-level-2026": "CNY 3,000–3,500 a month",
  "erasmus-mundus-emjm-2026": "€1,400 a month",
  "daad-epos-germany-2026": "€992–1,400 a month",
  "waterloo-cs-eng-ra-ta-2026": "CAD 46,737 a year",
  "georgia-tech-gra-gta-2026": "From $2,291 a month",
  "melbourne-rtp-scholarship-2026": "AUD 41,100 a year",
  "kaust-fellowship-2026": "$20,000–30,000 a year",
  "gates-cambridge-2026": "£23,152 a year",
  "eth-zurich-esop-2026": "CHF 13,500 a semester",
  "mext-japan-todai-2026": "¥143,000–145,000 a month",
  "kaist-global-fellowship-2026": "KRW 1,000,000 a month",
  "eiffel-excellence-2026": "€1,200–2,100 a month",
  "stipendium-hungaricum-2027": "From HUF 43,700 a month",
  "turkiye-burslari-2027": "TRY 9,500–13,000 a month",
  "gks-graduate-korea-2027": "KRW 900,000 a month",
  "commonwealth-uk-2028": "£1,712 a month",
  "swedish-institute-sisgp-2027": "SEK 12,000 a month",
  "swiss-government-excellence-2028": "CHF 2,450 a month",
  "canada-cgrs-doctoral-2027": "CAD 40,000 a year",
  "australia-awards-2028": "Living allowance set by DFAT",
  "nl-scholarship-2027": "€5,000 one-time",
  "vlir-uos-icp-2027": "About €1,400 a month",
  "taiwan-moe-icdf-2027": "NT$18,000–20,000 a month",
  "singa-singapore-2027": "S$2,700 a month",
  "hkpfs-hong-kong-2027": "HK$28,700 a month",
  "clarendon-oxford-2027": "About £21,800 a year",
  "rhodes-oxford-2028": "About £20,000 a year",
  "daad-helmut-schmidt-2028": "€992 a month",
  "oist-phd-japan-2028": "About ¥2.4 million a year",
  "mbzuai-uae-2027": "AED 15,500–17,500 a month",
  "nus-research-scholarship-2027": "S$3,000 a month",
  "tigp-academia-sinica-2027": "NT$40,000 a month",
  "daad-doctoral-germany-2028": "€1,400 a month",
  "epfl-excellence-2027": "CHF 10,000 a semester",
  "monash-mgs-2027": "AUD 37,145 a year",
  "usyd-rtp-international-2027": "AUD 44,293 a year",
  "uq-graduate-school-2027": "AUD 39,220 a year",
  "hbku-qatar-2027": "QAR 7,000–9,000 a month",
  "ksu-scholarship-2027": "SR 900 a month",
  "kfupm-graduate-2027": "SAR 2,500–5,000 a month",
  "brunei-government-2027": "BND 650 a month",
  "malaysia-mis-2027": "MYR 1,500 a month",
};

export function withStipendDisplay(s: Scholarship): Scholarship {
  const label = STIPEND_DISPLAY[s.id];
  return label ? { ...s, stipendDisplay: label } : s;
}
