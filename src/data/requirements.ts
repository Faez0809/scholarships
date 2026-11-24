import { Scholarship } from "../types/scholarship";

/**
 * Minimum grades and English scores, kept separately so they are easy to audit.
 *
 * Rule: a number appears only when the program's or university's official page states it.
 * Most scholarships publish no fixed CGPA or IELTS minimum; for those the value is 0
 * (nothing blocks you on ScholarTrack) and the note gives the official wording or tells
 * you to check the official page. Never fill a gap with a guess.
 *
 * Audited 2026-11-24.
 */
interface Requirement {
  minCGPA: number;
  minIELTS: number;
  note: string;
}

const NOT_PUBLISHED = "No fixed CGPA or English score is published for the scholarship. Strong grades help; check the official page for your program.";
const CHECKED = "2026-11-24";

export const REQUIREMENTS: Record<string, Requirement> = {
  // Confirmed numbers
  "kaust-fellowship-2026": {
    minCGPA: 3.0,
    minIELTS: 6.5,
    note: "KAUST's minimum GPA is 3.0 out of 4.0 (admitted students average about 3.7). IELTS 6.5 or TOEFL iBT 79; not needed if your degree is from the US, UK, Canada, Ireland, Australia or New Zealand.",
  },
  "mbzuai-uae-2027": {
    minCGPA: 3.2,
    minIELTS: 6.5,
    note: "CGPA 3.2 out of 4.0 or equivalent; IELTS Academic 6.5 or TOEFL iBT 90.",
  },
  "hbku-qatar-2027": {
    minCGPA: 3.0,
    minIELTS: 6.5,
    note: "Minimum CGPA 3.0 out of 4.0 (some colleges prefer 3.3). IELTS 6.5 or TOEFL 79 unless exempt; programs may set more.",
  },
  "gks-graduate-korea-2027": {
    minCGPA: 2.64,
    minIELTS: 0,
    note: "CGPA of 80% or above (2.64 on a 4.0 scale, 2.80 on 4.3, 2.91 on 4.5). English or Korean test scores are optional and earn extra points.",
  },
  "nus-research-scholarship-2027": {
    minCGPA: 0,
    minIELTS: 6.0,
    note: "No fixed CGPA. English minimum is IELTS 6.0 or TOEFL 85 in engineering; some faculties ask for IELTS 7.0.",
  },
  "australia-awards-2028": {
    minCGPA: 0,
    minIELTS: 6.5,
    note: "IELTS Academic 6.5 overall with no band below 6.0 before you travel; not needed at application. No fixed CGPA.",
  },
  "eth-zurich-esop-2026": {
    minCGPA: 0,
    minIELTS: 7.0,
    note: "Open to students in the top 10% of their Bachelor's class. ETH Master's admission needs English at C1 level (IELTS 7.0).",
  },
  "tu-delft-van-effen-2027": {
    minCGPA: 0,
    minIELTS: 6.5,
    note: "Reported as a CGPA of 80% or more; check the scale on TU Delft's page. TU Delft MSc admission needs IELTS 6.5 (6.0 per band).",
  },
  "melbourne-rtp-scholarship-2026": {
    minCGPA: 0,
    minIELTS: 6.5,
    note: "Ranked on research readiness (usually first-class honours or a research Master's). Research degrees need IELTS 6.5 with no band below 6.0.",
  },
  "monash-mgs-2027": {
    minCGPA: 0,
    minIELTS: 6.5,
    note: "Ranked on academic merit and research experience (usually first-class honours or equivalent). Research degrees need IELTS 6.5 with no band below 6.0.",
  },
  "usyd-rtp-international-2027": {
    minCGPA: 0,
    minIELTS: 6.5,
    note: "Ranked on academic merit and research potential. Research degrees need IELTS 6.5 with no band below 6.0.",
  },
  "uq-graduate-school-2027": {
    minCGPA: 0,
    minIELTS: 6.5,
    note: "Ranked on academic merit and research output. Research degrees need IELTS 6.5 with no band below 6.0.",
  },

  // Official wording, no single number
  "turkiye-burslari-2027": {
    minCGPA: 0,
    minIELTS: 0,
    note: "Minimum academic score of 75% for Master's and PhD applicants (90% for medicine, dentistry and pharmacy). No English test needed to apply.",
  },
  "chevening-uk-2028": {
    minCGPA: 0,
    minIELTS: 0,
    note: "A degree equal to a UK upper second-class (2:1) honours. Chevening has no English test of its own; each university sets its own minimum.",
  },
  "commonwealth-uk-2028": {
    minCGPA: 0,
    minIELTS: 0,
    note: "A first degree of at least upper second-class (2:1) honours, or lower second-class plus a relevant postgraduate degree. Universities set the English minimum.",
  },
  "oist-phd-japan-2028": {
    minCGPA: 0,
    minIELTS: 0,
    note: "No GPA cut-off. A TOEFL iBT or IELTS score is needed only if your degree was not taught in English, and there is no minimum score.",
  },
  "eiffel-excellence-2026": { minCGPA: 0, minIELTS: 0, note: "Nominated by a French university; no fixed CGPA. Each university sets its own English or French requirement." },
  "gates-cambridge-2026": { minCGPA: 0, minIELTS: 0, note: "Outstanding academic record required; Cambridge sets the grade and English minimum for each course." },
  "clarendon-oxford-2027": { minCGPA: 0, minIELTS: 0, note: "Awarded on academic excellence across all Oxford applicants; Oxford sets the grade and English minimum for each course." },
  "rhodes-oxford-2028": { minCGPA: 0, minIELTS: 0, note: "Each country round sets its own academic standard (usually first-class or equivalent); Oxford sets the English minimum." },
  "epfl-excellence-2027": { minCGPA: 0, minIELTS: 0, note: "For the strongest admitted Master's students; EPFL publishes no fixed CGPA. Check EPFL's English requirement for your program." },
  "csc-china-high-level-2026": { minCGPA: 0, minIELTS: 0, note: NOT_PUBLISHED },
  "erasmus-mundus-emjm-2026": { minCGPA: 0, minIELTS: 0, note: "Each Erasmus Mundus program sets its own grade and English requirements." },
  "daad-epos-germany-2026": { minCGPA: 0, minIELTS: 0, note: "Each EPOS course sets its own grade and language requirements; above-average results expected." },
  "waterloo-cs-eng-ra-ta-2026": { minCGPA: 0, minIELTS: 0, note: "Funding comes with admission; each department sets its grade and English minimum." },
  "georgia-tech-gra-gta-2026": { minCGPA: 0, minIELTS: 0, note: "No fixed GPA; the department sets its English test minimum." },
  "mext-japan-todai-2026": { minCGPA: 0, minIELTS: 0, note: NOT_PUBLISHED },
  "kaist-global-fellowship-2026": { minCGPA: 0, minIELTS: 0, note: NOT_PUBLISHED },
  "stipendium-hungaricum-2027": { minCGPA: 0, minIELTS: 0, note: "Each Hungarian university sets its own entry and language requirements." },
  "fulbright-foreign-student-2028": { minCGPA: 0, minIELTS: 0, note: "Your country's Fulbright office sets the academic and English requirements." },
  "swedish-institute-sisgp-2027": { minCGPA: 0, minIELTS: 0, note: "You must first be admitted to an eligible Swedish Master's program, which sets the grade and English minimum." },
  "swiss-government-excellence-2028": { minCGPA: 0, minIELTS: 0, note: "Requirements are set per country and by the host Swiss university." },
  "canada-cgrs-doctoral-2027": { minCGPA: 0, minIELTS: 0, note: "Requires a first-class average (A-) in each of the last two years of study." },
  "nl-scholarship-2027": { minCGPA: 0, minIELTS: 0, note: "Each Dutch university sets its own academic and English requirements." },
  "vlir-uos-icp-2027": { minCGPA: 0, minIELTS: 0, note: "Each Master's program sets its own grade and English requirements." },
  "taiwan-moe-icdf-2027": { minCGPA: 0, minIELTS: 0, note: NOT_PUBLISHED },
  "singa-singapore-2027": { minCGPA: 0, minIELTS: 0, note: "Requires a good Bachelor's or Master's degree; check the English requirement on the official page." },
  "hkpfs-hong-kong-2027": { minCGPA: 0, minIELTS: 0, note: "Each Hong Kong university sets its own grade and English requirements." },
  "adb-jsp-2027": { minCGPA: 0, minIELTS: 0, note: "Each partner university sets its own academic and English requirements." },
  "jds-japan-2027": { minCGPA: 0, minIELTS: 0, note: NOT_PUBLISHED },
  "daad-helmut-schmidt-2028": { minCGPA: 0, minIELTS: 0, note: "Above-average degree expected; each Master's program sets its English requirement." },
  "knight-hennessy-stanford-2028": { minCGPA: 0, minIELTS: 0, note: "No fixed GPA; you must also be admitted to a Stanford graduate program, which sets its own minimums." },
  "schwarzman-tsinghua-2028": { minCGPA: 0, minIELTS: 0, note: "No fixed GPA; English proficiency is required. Check the official page." },
  "yenching-pku-2027": { minCGPA: 0, minIELTS: 0, note: "No fixed GPA; English proficiency is required. Check the official page." },
  "tigp-academia-sinica-2027": { minCGPA: 0, minIELTS: 0, note: NOT_PUBLISHED },
  "daad-doctoral-germany-2028": { minCGPA: 0, minIELTS: 0, note: "Above-average degree expected; your German supervisor confirms the language needed." },
  "study-in-saudi-gov-2027": { minCGPA: 0, minIELTS: 0, note: "Each Saudi university sets its own grade and language requirements; many graduate programs teach in Arabic." },
  "kau-scholarship-2027": { minCGPA: 0, minIELTS: 0, note: "KAU sets requirements per program; you need a KAU admission letter before the scholarship application." },
  "ksu-scholarship-2027": { minCGPA: 0, minIELTS: 0, note: "Academically eligible students are nominated for KSU's Master's and doctoral programs; each program sets its own grades and language." },
  "kfupm-graduate-2027": { minCGPA: 0, minIELTS: 0, note: "Each KFUPM department sets its own grade, English and GRE requirements." },
  "iu-madinah-2027": { minCGPA: 0, minIELTS: 0, note: "A relevant degree with good grades; teaching is in Arabic. Check the current announcement on iu.edu.sa." },
  "alfaisal-phd-ga-2027": { minCGPA: 0, minIELTS: 0, note: "Assistantships are competitive and the stipend depends on experience and academic standing." },
  "khalifa-university-2027": { minCGPA: 0, minIELTS: 0, note: "Requirements and scholarship tier depend on your program and academic record; check the program page." },
  "brunei-government-2027": { minCGPA: 0, minIELTS: 0, note: "Master's applicants must be 35 or under on 1 July of the start year. Check your country's call for grade and English rules." },
  "malaysia-mis-2027": { minCGPA: 0, minIELTS: 0, note: "Only citizens of listed countries can apply; the official guidelines set the grade and English rules." },
};

/** Applies the audited minimums to a built-in program. */
export function withRequirements(s: Scholarship): Scholarship {
  const r = REQUIREMENTS[s.id];
  if (!r) return s;
  return { ...s, minCGPA: r.minCGPA, minIELTS: r.minIELTS, requirementsNote: r.note, requirementsChecked: CHECKED };
}
