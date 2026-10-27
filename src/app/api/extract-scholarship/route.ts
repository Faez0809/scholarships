export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  FieldCategory,
  FundingType,
  PartnerUniversity,
  Region,
  Scholarship,
  SupervisorRequirement,
} from "@/types/scholarship";

// Helper to scrape webpage content using Jina Reader with fallback to direct HTML strip
async function scrapeUrl(targetUrl: string): Promise<string> {
  // Try Jina Reader first
  try {
    const jinaUrl = `https://r.jina.ai/${targetUrl}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const jinaResponse = await fetch(jinaUrl, {
      headers: {
        Accept: "text/plain",
        "User-Agent": "ScholarTrack-Extractor/1.0",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (jinaResponse.ok) {
      const text = await jinaResponse.text();
      if (text && text.trim().length > 150) {
        return text.slice(0, 35000); // Truncate to 35k chars for prompt efficiency
      }
    }
  } catch (jinaErr) {
    console.warn("Jina Reader failed or timed out, falling back to direct fetch:", jinaErr);
  }

  // Fallback: Direct HTML fetch and tag stripping
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const directResponse = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (directResponse.ok) {
      const html = await directResponse.text();
      // Basic text extraction: strip scripts, styles, and tags
      const cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return cleanText.slice(0, 35000);
    }
  } catch (directErr) {
    console.error("Direct fetch also failed:", directErr);
  }

  throw new Error("Could not retrieve webpage content from the provided URL.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400 }
      );
    }

    // Validate URL scheme
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { error: "URL must begin with http:// or https://" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_KEY_HERE" || apiKey.includes("your_")) {
      return NextResponse.json(
        {
          error:
            "URL parser engine key is not configured in .env.local. Please check your environment configuration.",
        },
        { status: 500 }
      );
    }

    // Step A: Scrape webpage text
    const webpageText = await scrapeUrl(url);

    // Step B: Send to Gemini 2.5 Flash for structured extraction
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a world-class academic advisor and scholarship data extraction specialist for "ScholarTrack".
Analyze the following scholarship webpage text and extract structured information matching this exact JSON specification.

Webpage Source URL: ${url}

Webpage Content:
"""
${webpageText}
"""

Instructions:
1. name: Exact official name of the scholarship (e.g. "Chinese Government Scholarship - Silk Road Program", "Erasmus Mundus Joint Masters", "Graduate Research Assistantship").
2. university: Host university name or Consortium host (e.g., "China Scholarship Council (280+ Universities)", "European Commission Consortium", "University of Waterloo").
3. city: City where the university or main campus is located.
4. country: Country name.
5. countryFlag: Standard emoji flag of the country (e.g. "🇨🇳", "🇪🇺", "🇬🇧", "🇸🇦", "🇨🇭", "🇯🇵", "🇰🇷", "🇫🇷", "🇩🇪", "🇺🇸", "🇨🇦", "🇦🇺").
6. region: Must be exactly one of: "Europe", "Asia", "Americas", "Oceania", "Middle East", "Global".
7. fundingType: Must be exactly one of:
   - "Gov / Multi-Uni" (Umbrella government or multilateral programs like CSC China, Erasmus Mundus, DAAD, MEXT, Chevening, Fulbright)
   - "University Direct" (Single-university endowments like KAUST, Gates Cambridge, ETH ESOP, Clarendon)
   - "Supervisor / RA-TA" (Graduate programs funded through professor research lab grants, Research Assistantships, or Teaching Assistantships)
8. supervisorRequired: Must be exactly one of:
   - "Mandatory Before Applying" (Applicant must secure a written supervisor agreement before formal admission)
   - "Optional / Recommended" (Finding a professor helps but central admission is possible)
   - "Not Required (Central Admission)" (Admissions and funding are handled centrally without contacting professors)
9. partnerUniversities: If this is an umbrella / multi-university scholarship (like CSC, Erasmus Mundus, DAAD, Commonwealth), extract or list 3 to 5 prominent participating partner universities. Format each item as:
   {
     "name": "University Name",
     "city": "City",
     "country": "Country",
     "flag": "Flag emoji",
     "estimatedLivingCost": number (USD/mo for this city),
     "monthlyStipend": number (USD/mo),
     "rankingOrNote": "Short notable strength e.g. World #12 in AI / Low Living Cost",
     "website": "URL if available"
   }
   If this is a single university scholarship, omit partnerUniversities or set to null.
10. supervisorFundingGuide: If fundingType is "Supervisor / RA-TA" or supervisor is required/recommended, provide a practical 1-2 paragraph guide on how to approach professors, pitch research topics, and secure research assistantships at this university.
11. degrees: Array containing "Master's", "PhD", or both ["Master's", "PhD"].
12. field: Must be exactly one of: "Computer Science & AI", "Engineering", "Life Sciences", "Business & Social Sciences", "All Fields".
13. fieldSpecifics: String listing target subjects/majors mentioned (e.g. "Artificial Intelligence, Data Science, Electrical Engineering").
14. minCGPA: Minimum undergraduate CGPA on a 4.0 scale (number). If not explicitly stated, estimate a realistic minimum (e.g. 3.20 or 3.50 for prestigious awards).
15. minIELTS: Minimum IELTS score (number, e.g. 6.5, 7.0, 7.5). If not mentioned, estimate 6.5.
16. medium: "English Only" if courses are in English (almost always English for international scholarships), otherwise "Any".
17. deadline: Date in YYYY-MM-DD format. If date is not found or has passed, estimate the next upcoming cycle deadline (in late 2026 or early 2027).
18. monthlyStipendUSD: Convert any stated living allowance/stipend into equivalent Monthly USD (number). (e.g., £2,000/mo -> 2500, €1,500/mo -> 1650, 150,000 JPY -> 1000). If only tuition is covered and no living stipend is provided, set to 0.
19. estimatedLivingCostUSD: Estimate a realistic single-student Monthly Living Cost in USD for that specific city. CRITICAL: If the scholarship includes free housing/dormitory, subtract rent and estimate only food/transport (~$400-$700/mo). If student must pay market rent in high-cost cities like London/Zurich/Tokyo/Paris/Atlanta, estimate realistically ($1,200-$1,900/mo).
20. tuitionCovered: boolean (true if 100% tuition waiver).
21. healthInsuranceCovered: boolean (true if health insurance is provided).
22. relocationAirfareCovered: boolean (true if flight ticket/travel grant is covered).
23. housingProvided: boolean (true if on-campus housing or free accommodation is provided).
24. facilities: Array of strings detailing all perks & benefits (e.g. ["100% Full Tuition Waiver", "Monthly Living Stipend ($2,400/mo)", "Round-trip Airfare", "Health & Dental Insurance", "Visa Reimbursement", "Research & Travel Grant"]).
25. requiredDocuments: Array of strings detailing all required application materials (e.g. ["Statement of Purpose (SOP)", "Two Academic Letters of Recommendation (LOR)", "Official Transcripts & Degree Certificate", "Curriculum Vitae (CV)", "IELTS / TOEFL Score Report", "Research Proposal"]).
26. overview: 2-3 paragraph detailed summary of the academic prestige, research labs, ranking, and program quality.
27. cityLifeOverview: 1-2 paragraph description of living in this city (safety, cost of living, transit, international student community).
28. officialWebsiteUrl: The official application portal URL (use the provided URL if it's the official page).

Return ONLY valid JSON matching these fields. No markdown backticks, no explanations.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json(
        { error: "The webpage parser was unable to extract structured data from this URL." },
        { status: 500 }
      );
    }

    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // In case of any wrapping
      const cleaned = responseText
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    }

    // Validate and fill fallbacks
    const validFields: FieldCategory[] = [
      "Computer Science & AI",
      "Engineering",
      "Life Sciences",
      "Business & Social Sciences",
      "All Fields",
    ];

    const validRegions: Region[] = [
      "Europe",
      "Asia",
      "Americas",
      "Oceania",
      "Middle East",
      "Global",
    ];

    const validFundingTypes: FundingType[] = [
      "Gov / Multi-Uni",
      "University Direct",
      "Supervisor / RA-TA",
    ];

    const validSupervisorReqs: SupervisorRequirement[] = [
      "Mandatory Before Applying",
      "Optional / Recommended",
      "Not Required (Central Admission)",
    ];

    const result = {
      name: parsed.name || "Global Graduate Scholarship",
      university: parsed.university || "International University",
      city: parsed.city || "International City",
      country: parsed.country || "Worldwide",
      countryFlag: parsed.countryFlag || "🌍",
      region: validRegions.includes(parsed.region) ? parsed.region : "Global",
      fundingType: validFundingTypes.includes(parsed.fundingType)
        ? parsed.fundingType
        : "University Direct",
      supervisorRequired: validSupervisorReqs.includes(parsed.supervisorRequired)
        ? parsed.supervisorRequired
        : "Not Required (Central Admission)",
      partnerUniversities: Array.isArray(parsed.partnerUniversities) && parsed.partnerUniversities.length > 0
        ? parsed.partnerUniversities.map((u: any) => ({
            name: u.name || "Partner University",
            city: u.city || parsed.city,
            country: u.country || parsed.country,
            flag: u.flag || parsed.countryFlag || "🌍",
            estimatedLivingCost: typeof u.estimatedLivingCost === "number" ? u.estimatedLivingCost : 800,
            monthlyStipend: typeof u.monthlyStipend === "number" ? u.monthlyStipend : 1200,
            rankingOrNote: u.rankingOrNote || "",
            website: u.website || undefined,
          }))
        : undefined,
      supervisorFundingGuide: parsed.supervisorFundingGuide || undefined,
      degrees: Array.isArray(parsed.degrees) && parsed.degrees.length > 0
        ? parsed.degrees
        : ["Master's", "PhD"],
      field: validFields.includes(parsed.field) ? parsed.field : "All Fields",
      fieldSpecifics: parsed.fieldSpecifics || "General Graduate Programs",
      minCGPA: typeof parsed.minCGPA === "number" ? parsed.minCGPA : 3.2,
      minIELTS: typeof parsed.minIELTS === "number" ? parsed.minIELTS : 6.5,
      medium: parsed.medium === "Any" ? "Any" : "English Only",
      deadline: parsed.deadline || new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
      monthlyStipendUSD: typeof parsed.monthlyStipendUSD === "number" ? parsed.monthlyStipendUSD : 1500,
      estimatedLivingCostUSD: typeof parsed.estimatedLivingCostUSD === "number" ? parsed.estimatedLivingCostUSD : 900,
      tuitionCovered: parsed.tuitionCovered ?? true,
      healthInsuranceCovered: parsed.healthInsuranceCovered ?? true,
      relocationAirfareCovered: parsed.relocationAirfareCovered ?? false,
      housingProvided: parsed.housingProvided ?? false,
      facilities: Array.isArray(parsed.facilities) && parsed.facilities.length > 0
        ? parsed.facilities
        : ["100% Tuition Waiver", "Monthly Living Stipend", "Health Insurance"],
      requiredDocuments: Array.isArray(parsed.requiredDocuments) && parsed.requiredDocuments.length > 0
        ? parsed.requiredDocuments
        : [
            "Statement of Purpose (SOP)",
            "Two Letters of Recommendation (LOR)",
            "Official University Transcripts",
            "Curriculum Vitae (CV)",
            "English Language Certificate (IELTS/TOEFL)",
          ],
      overview: parsed.overview || "Prestigious graduate scholarship program offering comprehensive funding.",
      cityLifeOverview: parsed.cityLifeOverview || "Dynamic student city with diverse international community.",
      officialWebsiteUrl: parsed.officialWebsiteUrl || url,
    };

    return NextResponse.json({ success: true, scholarship: result });
  } catch (error: any) {
    console.error("Scholarship extraction error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred while parsing the scholarship webpage.",
      },
      { status: 500 }
    );
  }
}
