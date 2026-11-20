/**
 * Maps what a student types for their subject (a department name, a short form such as
 * "CSE" or "IPE", or a topic such as "thermodynamics") to one of ScholarTrack's broad
 * field categories. A curated table plus light typo tolerance; no network calls.
 *
 * Short forms follow common South Asian university usage, so "CE" is Civil Engineering
 * and "ME" is Mechanical Engineering.
 */

export type FieldCategoryValue = "Computer Science & AI" | "Engineering" | "Life Sciences" | "Business & Social Sciences";

export const FIELD_CATEGORY_LABELS: Record<FieldCategoryValue, string> = {
  "Computer Science & AI": "Computer Science & AI",
  Engineering: "Engineering, Physical Sciences & Maths",
  "Life Sciences": "Life Sciences, Health & Agriculture",
  "Business & Social Sciences": "Business, Social Sciences & Humanities",
};

interface Entry {
  name: string;
  cat: FieldCategoryValue;
  /** Short forms, matched exactly (dots and spaces ignored). */
  abbr?: string[];
  /** Other names and topics, matched by prefix, containment and typo tolerance. */
  aka?: string[];
}

const CS: FieldCategoryValue = "Computer Science & AI";
const ENG: FieldCategoryValue = "Engineering";
const LIFE: FieldCategoryValue = "Life Sciences";
const BUS: FieldCategoryValue = "Business & Social Sciences";

const ENTRIES: Entry[] = [
  // Computer Science & AI
  { name: "Computer Science & Engineering", cat: CS, abbr: ["cse", "cs", "csc", "cst", "bcs", "bcse"], aka: ["computer science", "computing", "computer science and technology", "programming", "algorithms", "theory of computation", "distributed systems", "operating systems", "computer networks"] },
  { name: "Computer Engineering", cat: CS, abbr: ["coe", "cpe", "ceng"], aka: ["computer systems engineering", "computer architecture", "embedded systems"] },
  { name: "Software Engineering", cat: CS, abbr: ["swe", "se"], aka: ["software development", "software"] },
  { name: "Information Technology", cat: CS, abbr: ["it", "ict", "iit", "bit"], aka: ["information and communication technology", "information science", "information systems engineering"] },
  { name: "Artificial Intelligence", cat: CS, abbr: ["ai"], aka: ["machine learning", "deep learning", "reinforcement learning", "neural networks", "natural language processing", "nlp", "computer vision", "robotics and ai", "llm", "large language models", "generative ai"] },
  { name: "Machine Learning", cat: CS, abbr: ["ml"], aka: ["statistical learning", "pattern recognition"] },
  { name: "Data Science", cat: CS, abbr: ["ds"], aka: ["data analytics", "big data", "data engineering", "data mining", "business analytics"] },
  { name: "Cybersecurity", cat: CS, aka: ["cyber security", "information security", "network security", "cryptography", "computer security"] },
  { name: "Human–Computer Interaction", cat: CS, abbr: ["hci"], aka: ["human computer interaction", "interaction design", "ux research"] },
  { name: "Bioinformatics", cat: CS, aka: ["computational biology", "computational genomics"] },

  // Engineering, physical sciences and maths
  { name: "Electrical & Electronic Engineering", cat: ENG, abbr: ["eee", "ee", "eece", "eie"], aka: ["electrical engineering", "electronic engineering", "electrical and electronics engineering", "power systems", "power engineering", "power electronics", "control systems", "signal processing", "vlsi", "circuits", "renewable energy", "smart grid", "semiconductors", "microelectronics", "photonics"] },
  { name: "Electronics & Communication Engineering", cat: ENG, abbr: ["ece", "ete", "etce", "ecte", "tce"], aka: ["electronics and telecommunication engineering", "telecommunication engineering", "communication engineering", "wireless communication", "electronics", "antenna", "5g"] },
  { name: "Mechanical Engineering", cat: ENG, abbr: ["me", "mech", "mce"], aka: ["thermodynamics", "fluid mechanics", "heat transfer", "machine design", "automotive engineering", "manufacturing", "cad", "solid mechanics", "turbomachinery", "hvac"] },
  { name: "Civil Engineering", cat: ENG, abbr: ["ce", "civil"], aka: ["structural engineering", "geotechnical engineering", "transportation engineering", "construction engineering", "construction management", "concrete", "earthquake engineering", "surveying"] },
  { name: "Water Resources Engineering", cat: ENG, abbr: ["wre"], aka: ["hydrology", "hydraulics", "coastal engineering", "river engineering"] },
  { name: "Environmental Engineering", cat: ENG, abbr: ["ese", "enve"], aka: ["environmental engineering", "wastewater", "water treatment", "air pollution"] },
  { name: "Industrial & Production Engineering", cat: ENG, abbr: ["ipe", "iem", "ie", "ise"], aka: ["industrial engineering", "production engineering", "operations research", "industrial and systems engineering", "lean manufacturing", "quality engineering"] },
  { name: "Chemical Engineering", cat: ENG, abbr: ["che", "chem eng", "cheme"], aka: ["chemical engineering", "process engineering", "petrochemical"] },
  { name: "Materials & Metallurgical Engineering", cat: ENG, abbr: ["mme", "mse", "gce"], aka: ["materials science", "materials engineering", "metallurgy", "nanotechnology", "nanomaterials", "ceramics", "glass and ceramic engineering", "polymers"] },
  { name: "Mechatronics & Robotics", cat: ENG, abbr: ["mte", "mct"], aka: ["mechatronics", "robotics", "automation", "control engineering"] },
  { name: "Aerospace Engineering", cat: ENG, abbr: ["ae", "aero", "ase"], aka: ["aeronautical engineering", "aeronautics", "astronautics", "space engineering", "avionics"] },
  { name: "Naval Architecture & Marine Engineering", cat: ENG, abbr: ["name", "nam"], aka: ["naval architecture", "marine engineering", "ocean engineering", "shipbuilding"] },
  { name: "Petroleum & Mining Engineering", cat: ENG, abbr: ["pme", "pmre", "pete"], aka: ["petroleum engineering", "mining engineering", "oil and gas", "mineral engineering"] },
  { name: "Nuclear Engineering", cat: ENG, abbr: ["ne", "nse"], aka: ["nuclear engineering", "nuclear science", "radiation"] },
  { name: "Textile Engineering", cat: ENG, abbr: ["te", "tex"], aka: ["textile engineering", "textile technology", "apparel engineering", "fashion technology"] },
  { name: "Leather Engineering", cat: ENG, abbr: ["le"], aka: ["leather technology", "footwear engineering"] },
  { name: "Architecture", cat: ENG, abbr: ["arch", "b arch", "barch"], aka: ["architectural design", "landscape architecture"] },
  { name: "Urban & Regional Planning", cat: ENG, abbr: ["urp", "mup"], aka: ["urban planning", "city planning", "regional planning", "town planning", "urban design", "transport planning"] },
  { name: "Biomedical Engineering", cat: ENG, abbr: ["bme"], aka: ["biomedical engineering", "medical devices", "biomechanics", "medical imaging", "bioengineering"] },
  { name: "Agricultural Engineering", cat: ENG, aka: ["farm machinery", "irrigation engineering", "farm power"] },
  { name: "Physics", cat: ENG, abbr: ["phy", "phys"], aka: ["applied physics", "theoretical physics", "condensed matter", "quantum physics", "quantum computing", "astrophysics", "astronomy", "optics", "particle physics", "engineering physics"] },
  { name: "Mathematics", cat: ENG, abbr: ["math", "maths", "amath"], aka: ["applied mathematics", "pure mathematics", "mathematical sciences", "numerical analysis", "algebra", "topology"] },
  { name: "Statistics", cat: ENG, abbr: ["stat", "stats", "isrt"], aka: ["applied statistics", "biostatistics", "probability", "actuarial science", "statistical science"] },
  { name: "Chemistry", cat: ENG, abbr: ["chem"], aka: ["applied chemistry", "organic chemistry", "inorganic chemistry", "physical chemistry", "analytical chemistry", "chemical technology"] },
  { name: "Geology & Earth Sciences", cat: ENG, aka: ["geology", "earth science", "geophysics", "geoscience", "seismology", "meteorology", "climate science", "atmospheric science", "disaster management"] },

  // Life sciences, health and agriculture
  { name: "Biochemistry & Molecular Biology", cat: LIFE, abbr: ["bmb", "bcmb"], aka: ["biochemistry", "molecular biology", "structural biology", "proteomics"] },
  { name: "Microbiology", cat: LIFE, abbr: ["micro"], aka: ["virology", "immunology", "bacteriology"] },
  { name: "Genetic Engineering & Biotechnology", cat: LIFE, abbr: ["geb", "gebt", "bt", "biotech"], aka: ["biotechnology", "genetic engineering", "genetics", "genomics", "molecular genetics", "crispr"] },
  { name: "Biology", cat: LIFE, abbr: ["bio"], aka: ["biological sciences", "life sciences", "botany", "zoology", "plant science", "cell biology", "ecology", "evolution", "marine biology", "neuroscience"] },
  { name: "Pharmacy", cat: LIFE, abbr: ["pharm", "bpharm", "b pharm", "pharmd"], aka: ["pharmaceutical sciences", "pharmacology", "drug discovery", "clinical pharmacy"] },
  { name: "Medicine", cat: LIFE, abbr: ["mbbs", "md", "bds", "dentistry"], aka: ["medical science", "clinical medicine", "surgery", "dental surgery", "biomedical science", "physiology", "anatomy", "pathology"] },
  { name: "Public Health", cat: LIFE, abbr: ["mph", "ph"], aka: ["epidemiology", "global health", "health policy", "community health", "nutrition", "health economics"] },
  { name: "Nursing & Allied Health", cat: LIFE, abbr: ["bsn"], aka: ["nursing", "physiotherapy", "occupational therapy", "midwifery", "radiography", "medical technology"] },
  { name: "Agriculture", cat: LIFE, abbr: ["agri", "agro", "bsag"], aka: ["agronomy", "agricultural science", "horticulture", "soil science", "crop science", "plant breeding", "agricultural economics", "agribusiness", "entomology"] },
  { name: "Fisheries & Marine Science", cat: LIFE, abbr: ["fish"], aka: ["fisheries", "aquaculture", "marine science", "oceanography"] },
  { name: "Veterinary Science", cat: LIFE, abbr: ["dvm", "vet"], aka: ["veterinary medicine", "animal science", "animal husbandry"] },
  { name: "Food Science & Technology", cat: LIFE, abbr: ["fst", "fet", "fe"], aka: ["food engineering", "food technology", "food science", "nutrition and food science"] },
  { name: "Environmental Science", cat: LIFE, abbr: ["envs", "esm"], aka: ["environmental science", "environmental studies", "forestry", "conservation", "biodiversity", "sustainability science"] },

  // Business, social sciences and humanities
  { name: "Business Administration", cat: BUS, abbr: ["bba", "mba", "emba", "bus", "ba"], aka: ["business", "management", "business studies", "strategy", "entrepreneurship", "operations management", "supply chain management", "supply chain", "logistics", "international business"] },
  { name: "Finance & Banking", cat: BUS, abbr: ["fin", "fb"], aka: ["finance", "banking", "investment", "financial economics", "insurance", "fintech"] },
  { name: "Accounting", cat: BUS, abbr: ["ais", "acc", "acct", "ca", "acca"], aka: ["accounting and information systems", "auditing", "taxation"] },
  { name: "Marketing", cat: BUS, abbr: ["mkt", "mktg"], aka: ["digital marketing", "consumer behaviour", "consumer behavior", "branding"] },
  { name: "Management Information Systems", cat: BUS, abbr: ["mis"], aka: ["information systems management", "business information systems"] },
  { name: "Human Resource Management", cat: BUS, abbr: ["hrm", "hr"], aka: ["human resources", "organizational behaviour", "organisational behavior"] },
  { name: "Economics", cat: BUS, abbr: ["econ", "eco"], aka: ["development economics", "applied economics", "econometrics", "microeconomics", "macroeconomics"] },
  { name: "Development Studies", cat: BUS, abbr: ["dev"], aka: ["international development", "poverty studies", "rural development"] },
  { name: "International Relations", cat: BUS, abbr: ["ir"], aka: ["international affairs", "diplomacy", "peace and conflict studies", "security studies", "global studies"] },
  { name: "Political Science", cat: BUS, abbr: ["pol sci", "polsci", "pols"], aka: ["politics", "government", "comparative politics"] },
  { name: "Public Administration & Policy", cat: BUS, abbr: ["mpa", "mpp", "pa"], aka: ["public administration", "public policy", "governance", "public management"] },
  { name: "Law", cat: BUS, abbr: ["llb", "llm", "jd"], aka: ["legal studies", "international law", "human rights law", "jurisprudence"] },
  { name: "Sociology & Anthropology", cat: BUS, abbr: ["soc"], aka: ["sociology", "anthropology", "social work", "gender studies", "population sciences", "demography"] },
  { name: "Psychology", cat: BUS, abbr: ["psy", "psych"], aka: ["clinical psychology", "cognitive science", "educational psychology"] },
  { name: "Education", cat: BUS, abbr: ["ied", "bed", "edu"], aka: ["teaching", "educational leadership", "curriculum studies", "tesol"] },
  { name: "Mass Communication & Journalism", cat: BUS, abbr: ["mcj", "jmc"], aka: ["journalism", "media studies", "communication studies", "film studies", "television"] },
  { name: "English & Literature", cat: BUS, abbr: ["eng lit", "english"], aka: ["english literature", "literature", "linguistics", "applied linguistics", "comparative literature", "language studies"] },
  { name: "History & Philosophy", cat: BUS, aka: ["history", "philosophy", "archaeology", "islamic history", "religious studies", "islamic studies"] },
  { name: "Geography", cat: BUS, abbr: ["geog", "gis"], aka: ["geography and environment", "human geography", "remote sensing"] },
  { name: "Fine Arts & Design", cat: BUS, abbr: ["bfa", "mfa"], aka: ["fine arts", "graphic design", "music", "theatre", "drawing and painting"] },
  { name: "Tourism & Hospitality", cat: BUS, abbr: ["thm"], aka: ["tourism", "hospitality management", "hotel management"] },
];

const STOP_PREFIX =
  /^(the |dept\.? of |department of |faculty of |school of |institute of |bachelor of science in |bachelor of |master of science in |master of |masters? in |ph\.?d\.? in |phd |b\.?sc\.? in |b\.?sc\.? |m\.?sc\.? in |m\.?sc\.? |bs in |ms in |b\.?eng\.? in |m\.?eng\.? in |degree in |major in |in )+/;

export function normalizeField(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(STOP_PREFIX, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const compact = (s: string) => normalizeField(s).replace(/ /g, "");

/** Edit distance with transpositions, capped for speed. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

const allowedTypos = (len: number) => (len >= 8 ? 2 : len >= 4 ? 1 : 0);
const FILLER = new Set(["and", "of", "in", "the", "engineering", "science", "sciences", "studies", "technology"]);

interface Prepared {
  entry: Entry;
  abbrs: string[];
  phrases: string[];
}

const PREPARED: Prepared[] = ENTRIES.map((entry) => ({
  entry,
  abbrs: (entry.abbr || []).map(compact),
  phrases: [entry.name, ...(entry.aka || [])].map(normalizeField),
}));

function scorePhrase(q: string, qTokens: string[], phrase: string): number {
  if (phrase === q) return 100;
  if (phrase.startsWith(q) && q.length >= 3) return 90;
  const pTokens = phrase.split(" ");
  // Every typed word starts a word of the phrase ("elec eng" -> "electrical engineering")
  if (q.length >= 2 && qTokens.every((t) => pTokens.some((p) => p.startsWith(t)))) return 82;
  // The typed text contains the whole phrase ("phd in power systems research")
  if (phrase.length >= 4 && ` ${q} `.includes(` ${phrase} `)) return 76;
  // Typo tolerance: each meaningful typed word is close to some word of the phrase
  const meaningful = qTokens.filter((t) => !FILLER.has(t));
  if (meaningful.length && meaningful.every((t) => t.length >= 4)) {
    const close = meaningful.every((t) =>
      pTokens.some((p) => p.length >= 4 && (editDistance(t, p, allowedTypos(t.length)) <= allowedTypos(t.length) || (t.length >= 5 && p.startsWith(t.slice(0, -1)) && editDistance(t, p.slice(0, t.length), 1) <= 1)))
    );
    // Prefer phrases that also contain the filler words typed ("computr science" -> computer science)
    if (close) return qTokens.every((t) => !FILLER.has(t) || pTokens.includes(t)) ? 65 : 62;
  }
  return 0;
}

export interface FieldMatch {
  name: string;
  category: FieldCategoryValue;
  categoryLabel: string;
  /** Short form the user typed, when the match came from one (e.g. "EEE"). */
  viaAbbr?: string;
  score: number;
}

export function matchField(input: string, limit = 6): FieldMatch[] {
  const q = normalizeField(input);
  if (!q) return [];
  const qc = q.replace(/ /g, "");
  const qTokens = q.split(" ");
  const results: FieldMatch[] = [];
  for (const { entry, abbrs, phrases } of PREPARED) {
    let score = 0;
    let viaAbbr: string | undefined;
    if (abbrs.includes(qc)) {
      score = 100;
      viaAbbr = input.trim().toUpperCase();
    } else if (qc.length >= 2 && qc.length <= 5 && abbrs.some((a) => a.startsWith(qc) && a.length - qc.length <= 1)) {
      score = 70;
    }
    for (const p of phrases) score = Math.max(score, scorePhrase(q, qTokens, p));
    if (score > 0) results.push({ name: entry.name, category: entry.cat, categoryLabel: FIELD_CATEGORY_LABELS[entry.cat], viaAbbr, score });
  }
  results.sort((a, b) => b.score - a.score || a.name.length - b.name.length);
  const seen = new Set<string>();
  return results.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true))).slice(0, limit);
}

/** The single best category for free text, or null when nothing is a confident match. */
export function bestFieldCategory(input: string, minScore = 76): FieldCategoryValue | null {
  const top = matchField(input, 1)[0];
  return top && top.score >= minScore ? top.category : null;
}
