import { Alumnus } from "../lib/alumni";

/**
 * Bangladeshi scholars found in public sources.
 *
 * Add someone only when the linked pages show all three: Bangladeshi, at this
 * university, and holding this scholarship. Never infer nationality from a name.
 * profileUrl must be a profile the person published and that an official page
 * links to; leave it out when there is no clear match.
 */
export const LISTED_ALUMNI: Alumnus[] = [
  // Gates Cambridge
  {
    id: "gates-cambridge:sayam-chowdhury",
    name: "Sayam Chowdhury",
    program: "gates-cambridge",
    university: "University of Cambridge (Selwyn College)",
    detail: "PhD Zoology, 2020 intake",
    profileUrl: "https://www.linkedin.com/in/chowdhurysu/",
    evidenceUrl: "https://www.gatescambridge.org/biography/17862/",
    evidenceLabel: "Gates Cambridge scholar profile",
    extraEvidenceUrl: "https://www.zoo.cam.ac.uk/people/sayam-chowdhury",
    extraEvidenceLabel: "Cambridge Zoology page",
    checked: "2026-11-26",
    source: "listed",
  },
  {
    id: "gates-cambridge:aliva-salmeen",
    name: "Aliva Salmeen",
    program: "gates-cambridge",
    university: "University of Cambridge (Lucy Cavendish College)",
    detail: "PhD Public Health and Primary Care, 2023 intake",
    profileUrl: "https://www.linkedin.com/in/aliva-salmeen-7a0a39186",
    evidenceUrl: "https://www.gatescambridge.org/biography/18714/",
    evidenceLabel: "Gates Cambridge scholar profile",
    extraEvidenceUrl: "https://www.phpc.cam.ac.uk/staff/dr-aliva-salmeen",
    extraEvidenceLabel: "Cambridge department page",
    checked: "2026-11-26",
    source: "listed",
  },

  // Commonwealth Scholarships (UK)
  {
    id: "commonwealth-uk:mashrur-arefin-ayon",
    name: "Mashrur Arefin Ayon",
    program: "commonwealth-uk",
    university: "University of Cambridge",
    detail: "MPhil Gender Studies, awarded 2025",
    evidenceUrl: "https://www.tbsnews.net/features/pursuit/how-one-cambridge-scholar-secured-commonwealth-scholarship-1485286",
    evidenceLabel: "The Business Standard",
    checked: "2026-11-26",
    source: "listed",
  },
  {
    id: "commonwealth-uk:md-shamsul-alam",
    name: "Md Shamsul Alam",
    program: "commonwealth-uk",
    university: "University of Sheffield",
    detail: "MSc Electronic and Electrical Engineering, awarded 2024",
    evidenceUrl: "https://en.prothomalo.com/amp/story/youth/education/p5afiz8tv7",
    evidenceLabel: "Prothom Alo",
    checked: "2026-11-26",
    source: "listed",
  },
  {
    id: "commonwealth-uk:fariha-khan",
    name: "Fariha Khan",
    program: "commonwealth-uk",
    university: "University of Oxford",
    detail: "Master's in Development Economics (Commonwealth Shared Scholarship)",
    evidenceUrl: "https://thefinancialexpress.com.bd/article/bd-youths-journey-to-oxford-university",
    evidenceLabel: "The Financial Express",
    checked: "2026-11-26",
    source: "listed",
  },

  // Schwarzman Scholars
  {
    id: "schwarzman-tsinghua:debpriya-das",
    name: "Debpriya Das",
    program: "schwarzman-tsinghua",
    university: "Tsinghua University (Schwarzman College)",
    detail: "2019 cohort, Bangladesh's first Schwarzman Scholar",
    evidenceUrl: "https://www.tbsnews.net/feature/debpriyas-journey-bioland-schwarzman-scholar-41089",
    evidenceLabel: "The Business Standard",
    checked: "2026-11-26",
    source: "listed",
  },

  // MEXT (Japanese Government). The listing is for Tokyo; these scholars held MEXT at other universities.
  {
    id: "mext-japan-todai:sabiha-mili",
    name: "Sabiha Mili",
    program: "mext-japan-todai",
    university: "Osaka University",
    detail: "Doctoral research, Graduate School of Economics (MEXT, university route)",
    evidenceUrl: "https://tbsgraduates.net/success-story/how-sabiha-turned-a-business-degree-into-a-research-career-with-a-mext-scholarship/",
    evidenceLabel: "TBS Graduates",
    checked: "2026-11-26",
    source: "listed",
  },
  {
    id: "mext-japan-todai:s-m-ali-reza",
    name: "Dr S. M. Ali Reza",
    program: "mext-japan-todai",
    university: "Tohoku University and Osaka University",
    detail: "Master of Law 2005 and PhD 2015 under MEXT; now Professor, University of Dhaka",
    profileUrl: "https://polisci.du.ac.bd/dr-s-m-ali-reza/",
    evidenceUrl: "https://www.bd.emb-japan.go.jp/en/education/reza.html",
    evidenceLabel: "Embassy of Japan in Bangladesh",
    checked: "2026-11-26",
    source: "listed",
  },
];
