/**
 * Accuracy checks for the field matcher. Run with: npm run check:fields
 * Each case is what a student might type and the field it should land in.
 */
import { matchField, bestFieldCategory } from "../src/utils/fieldMatch.ts";
import { expandPlaceQuery } from "../src/utils/searchAliases.ts";

type Cat = "Computer Science & AI" | "Engineering" | "Natural Sciences" | "Life Sciences" | "Business & Social Sciences";
const CS: Cat = "Computer Science & AI";
const ENG: Cat = "Engineering";
const NAT: Cat = "Natural Sciences";
const LIFE: Cat = "Life Sciences";
const BUS: Cat = "Business & Social Sciences";

// [typed text, expected category, expected top suggestion (optional)]
const CASES: [string, Cat, string?][] = [
  // Short forms
  ["CSE", CS, "Computer Science & Engineering"],
  ["cse", CS],
  ["C.S.E", CS],
  ["EEE", ENG, "Electrical & Electronic Engineering"],
  ["EE", ENG],
  ["ECE", ENG],
  ["ETE", ENG],
  ["ME", ENG, "Mechanical Engineering"],
  ["CE", ENG, "Civil Engineering"],
  ["IPE", ENG, "Industrial & Production Engineering"],
  ["URP", ENG, "Urban & Regional Planning"],
  ["BME", ENG, "Biomedical Engineering"],
  ["ChE", ENG, "Chemical Engineering"],
  ["MME", ENG],
  ["NAME", ENG],
  ["WRE", ENG],
  ["Arch", ENG, "Architecture"],
  ["BBA", BUS, "Business Administration"],
  ["MBA", BUS],
  ["AIS", BUS, "Accounting"],
  ["MIS", BUS],
  ["HRM", BUS],
  ["IR", BUS, "International Relations"],
  ["LLB", BUS, "Law"],
  ["MCJ", BUS],
  ["MBBS", LIFE, "Medicine"],
  ["MPH", LIFE, "Public Health"],
  ["BMB", LIFE],
  ["GEB", LIFE],
  ["B.Pharm", LIFE, "Pharmacy"],
  ["SWE", CS, "Software Engineering"],
  ["IT", CS, "Information Technology"],
  ["ICT", CS],
  ["AI", CS, "Artificial Intelligence"],
  ["ML", CS],
  // Department names, with prefixes and casing
  ["Department of Electrical and Electronic Engineering", ENG, "Electrical & Electronic Engineering"],
  ["Dept. of Computer Science", CS],
  ["BSc in Mechanical Engineering", ENG, "Mechanical Engineering"],
  ["Civil engineering", ENG],
  ["Industrial and Production Engineering", ENG],
  ["Urban and regional planning", ENG],
  ["Genetic Engineering and Biotechnology", LIFE],
  ["Biochemistry", LIFE],
  ["Microbiology", LIFE],
  ["Economics", BUS],
  ["Development Studies", BUS],
  ["Public Administration", BUS],
  ["English literature", BUS],
  ["Pharmacy", LIFE],
  ["Physics", NAT],
  ["Applied Mathematics", NAT],
  ["Statistics", NAT],
  ["Architecture", ENG],
  ["Chemistry", NAT, "Chemistry"],
  ["Dept. of Physics", NAT, "Physics"],
  ["Maths", NAT, "Mathematics"],
  ["quantum physics", NAT],
  ["organic chemistry", NAT],
  ["geology", NAT],
  ["astrophysics", NAT],
  ["chemical engineering", ENG, "Chemical Engineering"],
  ["engineering physics", NAT],
  // Subjects and research topics
  ["machine learning", CS],
  ["reinforcement learning", CS],
  ["computer vision", CS],
  ["natural language processing", CS],
  ["data science", CS],
  ["cyber security", CS],
  ["thermodynamics", ENG, "Mechanical Engineering"],
  ["fluid mechanics", ENG],
  ["power systems", ENG, "Electrical & Electronic Engineering"],
  ["VLSI", ENG],
  ["structural engineering", ENG, "Civil Engineering"],
  ["renewable energy", ENG],
  ["robotics", ENG],
  ["supply chain", BUS],
  ["finance", BUS],
  ["marketing", BUS],
  ["epidemiology", LIFE],
  ["public health", LIFE],
  ["agriculture", LIFE],
  ["neuroscience", LIFE],
  ["climate science", NAT],
  // Partial typing
  ["elec", ENG],
  ["mech", ENG],
  ["comp sci", CS],
  ["biotech", LIFE],
  ["econ", BUS],
  // Typos
  ["electical engineering", ENG],
  ["mechanichal engineering", ENG],
  ["thermodynamic", ENG],
  ["microbiolgy", LIFE],
  ["economcs", BUS],
  ["computr science", CS],
  ["phamacy", LIFE],
];

// Text that should not confidently match anything
const NO_MATCH = ["xyz", "qwerty", "asdfgh", "hello world"];

let failures = 0;
for (const [text, cat, top] of CASES) {
  const got = bestFieldCategory(text, 60);
  const first = matchField(text)[0];
  const okCat = got === cat;
  const okTop = !top || first?.name === top;
  if (!okCat || !okTop) {
    failures++;
    console.log(`FAIL  "${text}" -> ${first ? `${first.name} [${first.category}] score ${first.score}` : "no match"}; expected ${top ? `${top} ` : ""}[${cat}]`);
  }
}
for (const text of NO_MATCH) {
  const got = bestFieldCategory(text, 60);
  if (got) {
    failures++;
    console.log(`FAIL  "${text}" should not match, got ${got}`);
  }
}
// Place short forms used in the search box
const PLACES: [string, string][] = [
  ["KSA", "saudi arabia"],
  ["ksa", "saudi arabia"],
  ["UK", "united kingdom"],
  ["U.K.", "united kingdom"],
  ["USA", "united states"],
  ["US", "united states"],
  ["UAE", "united arab emirates"],
  ["Turkey", "turkiye"],
  ["Türkiye", "turkiye"],
  ["HK", "hong kong"],
  ["Holland", "netherlands"],
  ["Korea", "south korea"],
  ["Swiss", "switzerland"],
  ["Japan", "japan"],
  ["IT", "it"],
];
for (const [text, want] of PLACES) {
  const got = expandPlaceQuery(text);
  if (got !== want) {
    failures++;
    console.log(`FAIL  place "${text}" -> "${got}", expected "${want}"`);
  }
}

const total = CASES.length + NO_MATCH.length + PLACES.length;
console.log(`${total - failures}/${total} passed`);
if (failures) process.exit(1);
