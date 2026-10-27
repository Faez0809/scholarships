import { Scholarship } from "../types/scholarship";

// Helper to generate future dates relative to current date
function getFutureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export const SEED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "kaust-fellowship-2026",
    name: "KAUST Fellowship (Fully Funded MS & PhD)",
    university: "King Abdullah University of Science and Technology",
    city: "Thuwal",
    country: "Saudi Arabia",
    countryFlag: "🇸🇦",
    degrees: ["Master's", "PhD"],
    field: "Computer Science & AI",
    fieldSpecifics: "AI & Machine Learning, Computer Science, Cyber Security, Electrical Eng, Robotics",
    minCGPA: 3.50,
    minIELTS: 6.5,
    medium: "English Only",
    deadline: getFutureDate(25), // 25 days remaining
    monthlyStipendUSD: 2500,
    estimatedLivingCostUSD: 750,
    tuitionCovered: true,
    healthInsuranceCovered: true,
    relocationAirfareCovered: true,
    housingProvided: true,
    facilities: [
      "100% Full Tuition Waiver",
      "Free Furnished On-Campus Luxury Housing",
      "Annual Round-trip Flights Home",
      "Comprehensive Premium Medical & Dental Insurance",
      "$1,000 Relocation Settling Allowance",
      "Access to Shaheen III Supercomputer & Advanced Core Labs"
    ],
    requiredDocuments: [
      "Statement of Purpose (750 words on research objectives)",
      "Official University Transcripts & Degree Certificate",
      "Three Academic Letters of Recommendation",
      "Detailed Curriculum Vitae (CV)",
      "Official IELTS or TOEFL Score Report",
      "Passport Identification Page"
    ],
    overview:
      "KAUST is an international graduate research university situated on the Red Sea coast. Ranked among the top institutions globally for citation impact per faculty member, KAUST offers unprecedented lab funding, zero tuition, and an average monthly savings exceeding $1,750 because housing, utilities, and health coverage are 100% provided.",
    cityLifeOverview:
      "Thuwal is a secure, private seaside university community with private beaches, diving centers, golf courses, cycling tracks, and an international community representing over 100 countries. English is the universal language on campus.",
    officialWebsiteUrl: "https://www.kaust.edu.sa/en/study/admissions",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "gates-cambridge-2026",
    name: "Gates Cambridge Scholarship",
    university: "University of Cambridge",
    city: "Cambridge",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
    degrees: ["Master's", "PhD"],
    field: "All Fields",
    fieldSpecifics: "Computer Science, Engineering, Public Policy, Biotechnology, Pure & Applied Maths",
    minCGPA: 3.80,
    minIELTS: 7.5,
    medium: "English Only",
    deadline: getFutureDate(42),
    monthlyStipendUSD: 2400,
    estimatedLivingCostUSD: 1650,
    tuitionCovered: true,
    healthInsuranceCovered: true,
    relocationAirfareCovered: true,
    housingProvided: false,
    facilities: [
      "Full University Composition Fee & College Fees",
      "Maintenance Allowance (£20,000/yr / ~$2,400/mo)",
      "One Inbound & One Outbound Economy Airfare",
      "UK Student Visa Costs & NHS Healthcare Surcharge",
      "Academic Development Grant (£500–£2,000 for conferences)",
      "Family Allowance (if traveling with dependents)"
    ],
    requiredDocuments: [
      "Gates Cambridge 500-Word Statement of Social Commitment",
      "Detailed Research Proposal (for PhD & Research Master's)",
      "Two Academic References + One Gates Reference on Leadership",
      "Official Academic Transcripts (GPA > 3.8 / First Class)",
      "Updated Academic Resume / CV",
      "IELTS Academic Band 7.5+ Score Card"
    ],
    overview:
      "Established through a $210 million donation from the Bill & Melinda Gates Foundation, the Gates Cambridge Scholarship is one of the most prestigious international scholarships in the world. Scholars are selected for outstanding intellectual ability, reasons for choice of course, and a proven commitment to improving the lives of others.",
    cityLifeOverview:
      "Cambridge is a historic collegiate university city famed for its stunning gothic architecture, punting on the River Cam, and bicycle-friendly streets. It is also the focal point of 'Silicon Fen'—the highest concentration of deep-tech and AI startups in Europe.",
    officialWebsiteUrl: "https://www.gatescambridge.org/apply/eligibility-and-criteria/",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "eth-zurich-esop-2026",
    name: "ETH Excellence Scholarship & Opportunity Programme (ESOP)",
    university: "ETH Zurich",
    city: "Zurich",
    country: "Switzerland",
    countryFlag: "🇨🇭",
    degrees: ["Master's"],
    field: "Computer Science & AI",
    fieldSpecifics: "Computer Science, Data Science, Cyber Security, Mechanical & Electrical Eng",
    minCGPA: 3.80,
    minIELTS: 7.0,
    medium: "English Only",
    deadline: getFutureDate(18), // 18 days remaining -> Closing Soon!
    monthlyStipendUSD: 2450,
    estimatedLivingCostUSD: 1900,
    tuitionCovered: true,
    healthInsuranceCovered: false,
    relocationAirfareCovered: false,
    housingProvided: false,
    facilities: [
      "Full Tuition Fee Waiver (100%)",
      "Living & Study Grant of CHF 12,000 per semester (~$2,450/mo)",
      "Special ESOP Scholar Network & Direct Professor Mentorship",
      "Access to ETH Innovation Labs and Swiss Quantum Labs",
      "Priority Access to Master's Thesis Industry Partnerships"
    ],
    requiredDocuments: [
      "Master's Thesis Pre-Proposal (max 3 pages)",
      "Curriculum Vitae (CV) in Tabular Format",
      "Two Letters of Recommendation from University Professors",
      "Complete Bachelor Transcripts with Official Grading Scale",
      "IELTS Academic 7.0 or TOEFL iBT 100+",
      "Motivation Letter (highlighting academic uniqueness)"
    ],
    overview:
      "ETH Zurich consistently ranks among the top 10 universities globally. The ESOP scholarship is the highest honor ETH confers upon incoming master's students with exceptional undergraduate records, covering living expenses alongside a 100% tuition waiver.",
    cityLifeOverview:
      "Zurich is a global financial and technological powerhouse nestled by Lake Zurich with stunning Alpine vistas. Known for unmatched public transportation, pristine streets, high safety, and immediate proximity to nature.",
    officialWebsiteUrl: "https://ethz.ch/students/en/studies/financial/scholarships/excellence-scholarship.html",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mext-japan-todai-2026",
    name: "MEXT Japanese Government Recommendation (Todai)",
    university: "The University of Tokyo",
    city: "Tokyo",
    country: "Japan",
    countryFlag: "🇯🇵",
    degrees: ["Master's", "PhD"],
    field: "Engineering",
    fieldSpecifics: "Robotics, Information Science, Quantum Engineering, Precision Mechanics",
    minCGPA: 3.20,
    minIELTS: 6.5,
    medium: "English Only",
    deadline: getFutureDate(65),
    monthlyStipendUSD: 1100,
    estimatedLivingCostUSD: 850,
    tuitionCovered: true,
    healthInsuranceCovered: true,
    relocationAirfareCovered: true,
    housingProvided: false,
    facilities: [
      "100% Exemption from University Admission & Tuition Fees",
      "Monthly Tax-Free Living Allowance (147,000 JPY/mo)",
      "Round-trip International Economy Flights to Tokyo",
      "Free Intensive Japanese Language Training Courses",
      "Guaranteed Subsidized International Student Dormitory"
    ],
    requiredDocuments: [
      "MEXT Official Application Form",
      "Field of Study and Research Plan (Detailed 2-3 pages)",
      "Recommendation Letter from Dean or Department Head",
      "Certified Bachelor / Master Academic Transcripts",
      "Abstract of Undergraduate Thesis",
      "Certificate of Health from an Accredited Physician"
    ],
    overview:
      "The Japanese Government (MEXT) University Recommendation scholarship provides full financial backing to pursue graduate research at The University of Tokyo (Todai), Japan's most celebrated institution with over 15 Nobel Laureates.",
    cityLifeOverview:
      "Tokyo combines traditional tranquility with breathtaking modern tech infrastructure. Exceptionally safe, convenient 24/7 convenience stores, world-class culinary scenes, and rich cultural immersion.",
    officialWebsiteUrl: "https://www.u-tokyo.ac.jp/en/prospective-students/mext_scholarship.html",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "kaist-global-fellowship-2026",
    name: "KAIST Global Presidential Scholarship",
    university: "KAIST (Korea Advanced Institute of Science & Tech)",
    city: "Daejeon",
    country: "South Korea",
    countryFlag: "🇰🇷",
    degrees: ["Master's", "PhD"],
    field: "Computer Science & AI",
    fieldSpecifics: "Artificial Intelligence, Bio-Engineering, Electrical & Computing, Smart Cities",
    minCGPA: 3.30,
    minIELTS: 6.5,
    medium: "English Only",
    deadline: getFutureDate(48),
    monthlyStipendUSD: 1050,
    estimatedLivingCostUSD: 620,
    tuitionCovered: true,
    healthInsuranceCovered: true,
    relocationAirfareCovered: false,
    housingProvided: false,
    facilities: [
      "100% Tuition Fee Exemption for Full Degree Duration",
      "Monthly Living Allowance + Professor Research Grant (KRW 1,100,000+)",
      "National Health Insurance Premium Coverage",
      "Low-Cost Modern On-Campus Dormitory Guarantee",
      "Korean Language & Culture Integration Support"
    ],
    requiredDocuments: [
      "KAIST Online Graduate Application Form",
      "Statement of Purpose (Study Plan & Research Vision)",
      "Two Academic Letters of Recommendation (Direct Upload)",
      "Official University Transcripts & Degree Certificate",
      "English Proficiency Certificate (IELTS 6.5+ or TOEFL)",
      "Financial Declaration Statement"
    ],
    overview:
      "KAIST is South Korea's premier science and technology research institution, widely referred to as the MIT of Asia. Situated in Daedeok Innopolis, graduate research is conducted in English, with over 80% international graduate courses.",
    cityLifeOverview:
      "Daejeon is Korea's Silicon Valley, 50 minutes south of Seoul via KTX bullet train. It boasts low living costs, peaceful green campuses, vibrant student cafe culture, and safe bike paths throughout the research district.",
    officialWebsiteUrl: "https://admission.kaist.ac.kr/intl-graduate/",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "eiffel-excellence-2026",
    name: "Eiffel Excellence Scholarship (Campus France)",
    university: "Paris-Saclay & Sorbonne University",
    city: "Paris",
    country: "France",
    countryFlag: "🇫🇷",
    degrees: ["Master's", "PhD"],
    field: "Life Sciences",
    fieldSpecifics: "Bioinformatics, Genomics, Health Tech, Environmental Sciences, Green Chemistry",
    minCGPA: 3.60,
    minIELTS: 6.5,
    medium: "English Only",
    deadline: getFutureDate(22), // 22 days remaining -> Closing Soon!
    monthlyStipendUSD: 1650,
    estimatedLivingCostUSD: 1200,
    tuitionCovered: true,
    healthInsuranceCovered: true,
    relocationAirfareCovered: true,
    housingProvided: false,
    facilities: [
      "Monthly Living Allowance (€1,400 for Master's / €1,800 for PhD)",
      "Return International Airfare (Origin to France)",
      "French Social Security & Complementary Health Cover",
      "Campus France Priority CROUS Housing Reservation",
      "Cultural Activities, Trips, and French Language Programs"
    ],
    requiredDocuments: [
      "Candidate Curriculum Vitae (CV) in English or French",
      "Professional & Academic Career Plan (2 pages)",
      "Complete Higher Education Academic Transcripts",
      "Language Certification (English IELTS 6.5+ or French B2)",
      "Recommendation Letter from Department Chair or Dean"
    ],
    overview:
      "Funded by the French Ministry for Europe and Foreign Affairs, the Eiffel Scholarship aims to attract the world's top students to French universities for Master's and PhD programs across key scientific and technical domains.",
    cityLifeOverview:
      "Paris and the surrounding Saclay science cluster offer world-leading laboratories (CNRS, CEA), incredible museums, rich café culture, and student discounts across transport, cinema, and cultural venues.",
    officialWebsiteUrl: "https://www.campusfrance.org/en/the-eiffel-scholarship-program",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
