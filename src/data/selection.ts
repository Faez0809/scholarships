/**
 * "What strengthens your application": what each program's own selection criteria say
 * the selectors look for. Every point is taken from the linked official page (or a
 * participating university's official page where the program publishes criteria there).
 * Programs not listed here publish no specific criteria we could confirm, so the app
 * shows nothing rather than generic advice.
 *
 * Checked 2026-11-25.
 */
export interface SelectionCriteria {
  points: string[];
  sourceUrl: string;
  sourceLabel: string;
}

export const SELECTION_CHECKED = "2026-11-25";

export const SELECTION: Record<string, SelectionCriteria> = {
  "chevening-uk-2028": {
    points: [
      "At least 2,800 hours (about two years) of work experience after your first degree; paid, unpaid, part-time and voluntary work all count.",
      "Examples of leadership and of influencing others.",
      "Evidence that you build and use professional relationships (networking).",
      "A realistic career plan for creating positive change, and research into how Chevening helps you reach it.",
    ],
    sourceUrl: "https://www.chevening.org/resource-hub/guidance/prepare-your-application/",
    sourceLabel: "Chevening application guidance",
  },
  "gates-cambridge-2026": {
    points: [
      "Outstanding academic achievement.",
      "Capacity for leadership, which can be shown in many ways.",
      "Commitment to improving the lives of others.",
      "A strong case for your chosen course at Cambridge and how it fits your plans.",
    ],
    sourceUrl: "https://www.gatescambridge.org/apply/criteria/",
    sourceLabel: "Gates Cambridge selection criteria",
  },
  "knight-hennessy-stanford-2028": {
    points: ["Independence of thought.", "Purposeful leadership.", "A civic mindset: commitment to the greater good."],
    sourceUrl: "https://knight-hennessy.stanford.edu/admission/before-you-apply/criteria",
    sourceLabel: "Knight-Hennessy criteria",
  },
  "schwarzman-tsinghua-2028": {
    points: [
      "Leadership is the focus of selection: what you have led and your potential to lead.",
      "Strong intellectual capacity and academic ability.",
      "Exemplary character.",
      "Recommenders who can speak to your leadership, intellect and character.",
    ],
    sourceUrl: "https://www.schwarzmanscholars.org/admissions/",
    sourceLabel: "Schwarzman Scholars admissions",
  },
  "rhodes-oxford-2028": {
    points: [
      "Academic excellence: sustained, outstanding achievement.",
      "Energy to use your talents to the full.",
      "Character: truth, courage, devotion to duty, care for others.",
      "Moral force of character and the instinct to lead.",
    ],
    sourceUrl: "https://www.rhodeshouse.ox.ac.uk/scholarships/selection-criteria/",
    sourceLabel: "Rhodes selection criteria",
  },
  "commonwealth-uk-2028": {
    points: [
      "Academic merit.",
      "The likely impact of your work on your country's development.",
      "The quality of your study plan (Master's) or research proposal (PhD), plus your personal statement.",
    ],
    sourceUrl: "https://cscuk.fcdo.gov.uk/selection-criteria/",
    sourceLabel: "CSC selection criteria",
  },
  "clarendon-oxford-2027": {
    points: ["Awarded on academic excellence and potential across all subjects; there is no separate essay."],
    sourceUrl: "https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/clarendon/applicants",
    sourceLabel: "Oxford: Clarendon for applicants",
  },
  "daad-epos-germany-2026": {
    points: [
      "At least two years of relevant professional experience after your Bachelor's, at the time of applying.",
      "Far above average results (upper third of your class).",
      "Motivation linked to development in your home country.",
    ],
    sourceUrl: "https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/",
    sourceLabel: "DAAD EPOS programme page",
  },
  "daad-helmut-schmidt-2028": {
    points: [
      "Your study results so far.",
      "Political and social engagement, such as community service, volunteering or NGO work.",
      "English skills (and German where the course asks for it), plus each Master's course's own requirements.",
    ],
    sourceUrl: "https://www.daad.de/en/studying-in-germany/scholarships/daad-funding-programmes/helmut-schmidt-programme/",
    sourceLabel: "DAAD Helmut-Schmidt-Programme",
  },
  "hkpfs-hong-kong-2027": {
    points: [
      "Academic excellence comes first.",
      "Research ability and potential.",
      "Communication and interpersonal skills.",
      "Leadership ability.",
    ],
    sourceUrl: "https://www.cityu.edu.hk/en/pg/hong-kong-phd-fellowship-scheme/about-the-scheme",
    sourceLabel: "HKPFS (CityU, a participating university)",
  },
  "adb-jsp-2027": {
    points: [
      "At least two years of full-time professional work experience after your degree; internships and volunteering do not count.",
      "Usually 35 or under when you apply.",
      "Commitment to return and contribute to your country's development.",
    ],
    sourceUrl: "https://www.keio.ac.jp/en/st/admissions-en/scholarships/adb/",
    sourceLabel: "ADB-JSP (Keio, a partner university)",
  },
  "australia-awards-2028": {
    points: [
      "Academic or technical competence.",
      "Professional and personal leadership qualities.",
      "Your potential to contribute to development in your country, the most important factor in many country programs.",
    ],
    sourceUrl: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
    sourceLabel: "Australia Awards (DFAT)",
  },
  "eth-zurich-esop-2026": {
    points: [
      "Being in the top 10% of your Bachelor's class.",
      "A Master's thesis pre-proposal, submitted with your application in the November window.",
    ],
    sourceUrl: "https://ethz.ch/students/en/studies/financial/scholarships/excellence-scholarship.html",
    sourceLabel: "ETH Excellence Scholarship",
  },
  "kaust-fellowship-2026": {
    points: ["Admitted students have an average GPA of about 3.7, well above the 3.0 minimum."],
    sourceUrl: "https://kaust.edu.sa/study/admissions-faqs",
    sourceLabel: "KAUST admissions FAQ",
  },
};
