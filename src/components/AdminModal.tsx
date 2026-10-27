"use client";

import React, { useState, useEffect } from "react";
import { useScholarship } from "../context/ScholarshipContext";
import {
  DegreeLevel,
  FieldCategory,
  FundingType,
  MediumOfInstruction,
  PartnerUniversity,
  Region,
  SupervisorRequirement,
} from "../types/scholarship";
import {
  X,
  Sparkles,
  Save,
  Globe2,
  Building2,
  DollarSign,
  GraduationCap,
  Calendar,
  AlertCircle,
  Link2,
  Check,
  Loader2,
  Landmark,
  Microscope,
  Users,
} from "lucide-react";

export const AdminModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingScholarship,
    setEditingScholarship,
    addScholarship,
    updateScholarship,
  } = useScholarship();

  // AI Auto-Fill State
  const [autoFillUrl, setAutoFillUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [countryFlag, setCountryFlag] = useState("🌍");
  const [region, setRegion] = useState<Region>("Europe");
  const [fundingType, setFundingType] = useState<FundingType>("University Direct");
  const [supervisorRequired, setSupervisorRequired] =
    useState<SupervisorRequirement>("Not Required (Central Admission)");
  const [supervisorFundingGuide, setSupervisorFundingGuide] = useState("");
  const [partnerUnisText, setPartnerUnisText] = useState("");
  const [degrees, setDegrees] = useState<DegreeLevel[]>(["Master's", "PhD"]);
  const [field, setField] = useState<FieldCategory>("Computer Science & AI");
  const [fieldSpecifics, setFieldSpecifics] = useState("");
  const [minCGPA, setMinCGPA] = useState(3.5);
  const [minIELTS, setMinIELTS] = useState(6.5);
  const [medium, setMedium] = useState<MediumOfInstruction>("English Only");
  const [deadline, setDeadline] = useState("");
  const [monthlyStipendUSD, setMonthlyStipendUSD] = useState(2000);
  const [estimatedLivingCostUSD, setEstimatedLivingCostUSD] = useState(1000);
  const [facilitiesText, setFacilitiesText] = useState("");
  const [documentsText, setDocumentsText] = useState("");
  const [overview, setOverview] = useState("");
  const [cityLifeOverview, setCityLifeOverview] = useState("");
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state when editingScholarship changes
  useEffect(() => {
    if (editingScholarship) {
      setName(editingScholarship.name);
      setUniversity(editingScholarship.university);
      setCity(editingScholarship.city);
      setCountry(editingScholarship.country);
      setCountryFlag(editingScholarship.countryFlag || "🌍");
      setRegion(editingScholarship.region || "Europe");
      setFundingType(editingScholarship.fundingType || "University Direct");
      setSupervisorRequired(
        editingScholarship.supervisorRequired ||
          "Not Required (Central Admission)"
      );
      setSupervisorFundingGuide(editingScholarship.supervisorFundingGuide || "");

      if (
        editingScholarship.partnerUniversities &&
        editingScholarship.partnerUniversities.length > 0
      ) {
        setPartnerUnisText(
          editingScholarship.partnerUniversities
            .map(
              (u) =>
                `${u.name} | ${u.city} | ${u.country} | ${u.flag} | ${u.estimatedLivingCost} | ${u.monthlyStipend} | ${u.rankingOrNote}`
            )
            .join("\n")
        );
      } else {
        setPartnerUnisText("");
      }

      setDegrees(editingScholarship.degrees);
      setField(editingScholarship.field);
      setFieldSpecifics(editingScholarship.fieldSpecifics || "");
      setMinCGPA(editingScholarship.minCGPA);
      setMinIELTS(editingScholarship.minIELTS);
      setMedium(editingScholarship.medium);
      setDeadline(editingScholarship.deadline);
      setMonthlyStipendUSD(editingScholarship.monthlyStipendUSD);
      setEstimatedLivingCostUSD(editingScholarship.estimatedLivingCostUSD);
      setFacilitiesText(editingScholarship.facilities.join("\n"));
      setDocumentsText(editingScholarship.requiredDocuments.join("\n"));
      setOverview(editingScholarship.overview);
      setCityLifeOverview(editingScholarship.cityLifeOverview);
      setOfficialWebsiteUrl(editingScholarship.officialWebsiteUrl);
      setAutoFillUrl(editingScholarship.officialWebsiteUrl || "");
    } else {
      // Defaults for brand new scholarship
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 45);
      setName("");
      setUniversity("");
      setCity("");
      setCountry("");
      setCountryFlag("🌍");
      setRegion("Europe");
      setFundingType("University Direct");
      setSupervisorRequired("Not Required (Central Admission)");
      setSupervisorFundingGuide("");
      setPartnerUnisText("");
      setDegrees(["Master's", "PhD"]);
      setField("Computer Science & AI");
      setFieldSpecifics("");
      setMinCGPA(3.5);
      setMinIELTS(6.5);
      setMedium("English Only");
      setDeadline(defaultDate.toISOString().split("T")[0]);
      setMonthlyStipendUSD(2000);
      setEstimatedLivingCostUSD(1000);
      setFacilitiesText(
        "100% Full Tuition Waiver\nMonthly Stipend Grant\nHealth & Dental Insurance\nRoundtrip Flight Allowance"
      );
      setDocumentsText(
        "Statement of Purpose (SOP)\nTwo Academic Letters of Recommendation (LOR)\nOfficial University Transcripts\nCurriculum Vitae (CV)\nEnglish Proficiency Certificate (IELTS/TOEFL)"
      );
      setOverview("World-class university offering cutting-edge graduate research.");
      setCityLifeOverview("Vibrant student city with affordable living and rich cultural life.");
      setOfficialWebsiteUrl("");
      setAutoFillUrl("");
    }
    setErrors({});
    setIsExtracting(false);
    setExtractError(null);
    setExtractSuccess(false);
  }, [editingScholarship, isAddModalOpen]);

  if (!isAddModalOpen) return null;

  const handleDegreeToggle = (deg: DegreeLevel) => {
    if (degrees.includes(deg)) {
      if (degrees.length > 1) {
        setDegrees(degrees.filter((d) => d !== deg));
      }
    } else {
      setDegrees([...degrees, deg]);
    }
  };

  const handleAutoFillClick = async (e: React.FormEvent) => {
    e.preventDefault();
    let urlToFetch = autoFillUrl.trim();
    if (!urlToFetch) {
      setExtractError("Please paste a scholarship webpage URL first.");
      return;
    }

    if (!urlToFetch.startsWith("http://") && !urlToFetch.startsWith("https://")) {
      urlToFetch = "https://" + urlToFetch;
      setAutoFillUrl(urlToFetch);
    }

    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(false);

    try {
      const response = await fetch("/api/extract-scholarship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to extract scholarship details.");
      }

      const s = data.scholarship;

      // Populate form state with AI extracted values
      setName(s.name || "");
      setUniversity(s.university || "");
      setCity(s.city || "");
      setCountry(s.country || "");
      setCountryFlag(s.countryFlag || "🌍");
      if (s.region) setRegion(s.region);
      if (s.fundingType) setFundingType(s.fundingType);
      if (s.supervisorRequired) setSupervisorRequired(s.supervisorRequired);
      if (s.supervisorFundingGuide) setSupervisorFundingGuide(s.supervisorFundingGuide);

      if (Array.isArray(s.partnerUniversities) && s.partnerUniversities.length > 0) {
        setPartnerUnisText(
          s.partnerUniversities
            .map(
              (u: any) =>
                `${u.name} | ${u.city} | ${u.country} | ${u.flag || "🌍"} | ${u.estimatedLivingCost} | ${u.monthlyStipend} | ${u.rankingOrNote}`
            )
            .join("\n")
        );
      }

      if (Array.isArray(s.degrees) && s.degrees.length > 0) {
        setDegrees(s.degrees);
      }
      if (s.field) {
        setField(s.field);
      }
      setFieldSpecifics(s.fieldSpecifics || "");
      if (typeof s.minCGPA === "number") setMinCGPA(s.minCGPA);
      if (typeof s.minIELTS === "number") setMinIELTS(s.minIELTS);
      if (s.medium) setMedium(s.medium);
      if (s.deadline) setDeadline(s.deadline);
      if (typeof s.monthlyStipendUSD === "number") setMonthlyStipendUSD(s.monthlyStipendUSD);
      if (typeof s.estimatedLivingCostUSD === "number") setEstimatedLivingCostUSD(s.estimatedLivingCostUSD);
      if (Array.isArray(s.facilities) && s.facilities.length > 0) {
        setFacilitiesText(s.facilities.join("\n"));
      }
      if (Array.isArray(s.requiredDocuments) && s.requiredDocuments.length > 0) {
        setDocumentsText(s.requiredDocuments.join("\n"));
      }
      if (s.overview) setOverview(s.overview);
      if (s.cityLifeOverview) setCityLifeOverview(s.cityLifeOverview);
      if (s.officialWebsiteUrl) setOfficialWebsiteUrl(s.officialWebsiteUrl);

      setExtractSuccess(true);
    } catch (err: any) {
      console.error("Auto-extraction failed:", err);
      setExtractError(err.message || "An error occurred during extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingScholarship(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Scholarship title is required.";
    if (!university.trim()) newErrors.university = "University name is required.";
    if (!city.trim()) newErrors.city = "City is required.";
    if (!country.trim()) newErrors.country = "Country is required.";
    if (!deadline) newErrors.deadline = "Deadline date is required.";
    if (!officialWebsiteUrl.trim()) newErrors.officialWebsiteUrl = "Official URL is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const facilities = facilitiesText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const requiredDocuments = documentsText
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);

    // Parse partner universities if provided
    let parsedPartnerUnis: PartnerUniversity[] | undefined = undefined;
    if (partnerUnisText.trim()) {
      parsedPartnerUnis = partnerUnisText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split("|").map((p) => p.trim());
          return {
            name: parts[0] || "Partner Institution",
            city: parts[1] || city,
            country: parts[2] || country,
            flag: parts[3] || countryFlag,
            estimatedLivingCost: parseInt(parts[4] || String(estimatedLivingCostUSD), 10),
            monthlyStipend: parseInt(parts[5] || String(monthlyStipendUSD), 10),
            rankingOrNote: parts[6] || "",
          };
        });
    }

    const payload = {
      name: name.trim(),
      university: university.trim(),
      city: city.trim(),
      country: country.trim(),
      countryFlag: countryFlag.trim() || "🌍",
      region,
      fundingType,
      supervisorRequired,
      partnerUniversities: parsedPartnerUnis,
      supervisorFundingGuide: supervisorFundingGuide.trim() || undefined,
      degrees,
      field,
      fieldSpecifics: fieldSpecifics.trim(),
      minCGPA: Number(minCGPA),
      minIELTS: Number(minIELTS),
      medium,
      deadline,
      monthlyStipendUSD: Number(monthlyStipendUSD),
      estimatedLivingCostUSD: Number(estimatedLivingCostUSD),
      tuitionCovered: true,
      healthInsuranceCovered: true,
      relocationAirfareCovered: true,
      housingProvided: facilities.some((f) => f.toLowerCase().includes("housing")),
      facilities: facilities.length > 0 ? facilities : ["100% Tuition Waiver", "Monthly Stipend"],
      requiredDocuments:
        requiredDocuments.length > 0
          ? requiredDocuments
          : ["Statement of Purpose", "Transcripts", "CV"],
      overview: overview.trim() || "Prestigious graduate scholarship program.",
      cityLifeOverview: cityLifeOverview.trim() || "Modern student friendly city.",
      officialWebsiteUrl: officialWebsiteUrl.trim(),
    };

    if (editingScholarship) {
      updateScholarship(editingScholarship.id, payload);
    } else {
      addScholarship(payload);
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                {editingScholarship ? "Edit Scholarship Details" : "Add New Scholarship"}
              </h2>
              <p className="text-xs text-zinc-500">
                Live changes will update the search index &amp; localStorage immediately
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* AI Auto-Fill from URL Section */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-violet-50/30 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                AI URL Auto-Extractor (Gemini 2.5 Flash)
              </span>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-800">
                Multi-Uni &amp; Supervisor Aware
              </span>
            </div>
            <p className="text-xs text-indigo-900/80 mb-3">
              Paste any government portal (CSC, Erasmus, DAAD) or university lab RA/TA link to auto-parse requirements, funding models, partner universities, and living costs:
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="url"
                  value={autoFillUrl}
                  disabled={isExtracting}
                  onChange={(e) => {
                    setAutoFillUrl(e.target.value);
                    if (extractError) setExtractError(null);
                    if (extractSuccess) setExtractSuccess(false);
                  }}
                  placeholder="https://www.campuschina.org or https://uwaterloo.ca/graduate-studies"
                  className="w-full rounded-lg border border-indigo-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none disabled:bg-zinc-100"
                />
              </div>
              <button
                type="button"
                onClick={handleAutoFillClick}
                disabled={isExtracting || !autoFillUrl.trim()}
                className="flex items-center justify-center gap-1.5 shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Extract &amp; Auto-Fill</span>
                  </>
                )}
              </button>
            </div>

            {/* Loading Indicator */}
            {isExtracting && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/90 p-2.5 text-xs text-indigo-900 border border-indigo-200">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
                <span className="font-medium">
                  Reading webpage, detecting funding model &amp; parsing partner universities with Gemini Flash...
                </span>
              </div>
            )}

            {/* Success Feedback */}
            {extractSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-950 border border-emerald-200 font-medium">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  ✨ Extracted successfully! Review the parsed scholarship data below, make any tweaks, and click Save.
                </span>
              </div>
            )}

            {/* Error Feedback */}
            {extractError && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-900 border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Extraction Error:</span> {extractError}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-4">
            {/* Title & University */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Scholarship Title *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chinese Government Scholarship (CSC)"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  University / Consortium Host *
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. China Scholarship Council (Consortium of 280+ Universities)"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
                {errors.university && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.university}</p>
                )}
              </div>
            </div>

            {/* City, Country, Flag, Region */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Beijing"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
                {errors.city && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. China"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
                {errors.country && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.country}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Flag Emoji
                </label>
                <input
                  type="text"
                  value={countryFlag}
                  onChange={(e) => setCountryFlag(e.target.value)}
                  placeholder="e.g. 🇨🇳"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  World Region *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Americas">Americas</option>
                  <option value="Oceania">Oceania</option>
                  <option value="Middle East">Middle East</option>
                  <option value="Global">Global</option>
                </select>
              </div>
            </div>

            {/* Funding Model & Supervisor Requirement */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-zinc-600" />
                  Funding Model Track *
                </label>
                <select
                  value={fundingType}
                  onChange={(e) => setFundingType(e.target.value as FundingType)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="Gov / Multi-Uni">
                    🏛️ Gov / Multi-Uni (CSC, Erasmus, DAAD)
                  </option>
                  <option value="University Direct">
                    🎓 University Direct Fellowship (KAUST, Gates, ETH)
                  </option>
                  <option value="Supervisor / RA-TA">
                    🔬 Supervisor RA / TA (Canada, USA, Aus)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1 flex items-center gap-1.5">
                  <Microscope className="h-3.5 w-3.5 text-zinc-600" />
                  Supervisor Requirement *
                </label>
                <select
                  value={supervisorRequired}
                  onChange={(e) =>
                    setSupervisorRequired(e.target.value as SupervisorRequirement)
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="Not Required (Central Admission)">
                    ✅ Not Required (Central Admission)
                  </option>
                  <option value="Optional / Recommended">
                    🤝 Optional / Recommended
                  </option>
                  <option value="Mandatory Before Applying">
                    👨‍🏫 Mandatory Before Applying
                  </option>
                </select>
              </div>
            </div>

            {/* Partner Universities Editor (For Umbrella Programs) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-600" />
                  Participating Partner Universities (One per line)
                </label>
                <span className="text-[10px] text-zinc-400">
                  Format: Name | City | Country | Flag | LivingCost | Stipend | Note
                </span>
              </div>
              <textarea
                rows={3}
                value={partnerUnisText}
                onChange={(e) => setPartnerUnisText(e.target.value)}
                placeholder="Tsinghua University | Beijing | China | 🇨🇳 | 550 | 900 | World #12 in Engineering&#10;Zhejiang University | Hangzhou | China | 🇨🇳 | 450 | 850 | China Silicon Valley Hub"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            {/* Supervisor Funding Guide (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Supervisor &amp; Lab Funding Guide (For RA/TA programs)
              </label>
              <textarea
                rows={2}
                value={supervisorFundingGuide}
                onChange={(e) => setSupervisorFundingGuide(e.target.value)}
                placeholder="How to approach professors at this university, cold email pitch tips, lab directories..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Degree Levels & Field */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Target Degree Levels
                </label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={degrees.includes("Master's")}
                      onChange={() => handleDegreeToggle("Master's")}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Master&apos;s</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={degrees.includes("PhD")}
                      onChange={() => handleDegreeToggle("PhD")}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>PhD</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Major / Field Category
                </label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value as FieldCategory)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Computer Science & AI">Computer Science & AI</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Life Sciences">Life Sciences</option>
                  <option value="Business & Social Sciences">Business & Social Sciences</option>
                  <option value="All Fields">All Fields</option>
                </select>
              </div>
            </div>

            {/* Field Specifics */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Field Specifics / Keywords
              </label>
              <input
                type="text"
                value={fieldSpecifics}
                onChange={(e) => setFieldSpecifics(e.target.value)}
                placeholder="e.g. AI & Machine Learning, Robotics, Cyber Security"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Requirements: Min CGPA, Min IELTS, Medium, Deadline */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Min CGPA (4.0)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="2.0"
                  max="4.0"
                  value={minCGPA}
                  onChange={(e) => setMinCGPA(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Min IELTS Band
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9.0"
                  value={minIELTS}
                  onChange={(e) => setMinIELTS(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Medium
                </label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value as MediumOfInstruction)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="English Only">English Only</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
                {errors.deadline && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.deadline}</p>
                )}
              </div>
            </div>

            {/* Finances: Stipend & Living Cost */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                  Monthly Stipend ($ USD)
                </label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={monthlyStipendUSD}
                  onChange={(e) => setMonthlyStipendUSD(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                  Est. City Living Cost ($ USD)
                </label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={estimatedLivingCostUSD}
                  onChange={(e) => setEstimatedLivingCostUSD(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Facilities Tags (One per line) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Scholarship Facilities &amp; Benefits (One benefit per line)
              </label>
              <textarea
                rows={3}
                value={facilitiesText}
                onChange={(e) => setFacilitiesText(e.target.value)}
                placeholder="100% Full Tuition Waiver&#10;Free Furnished Housing&#10;Annual Flight Home"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            {/* Required Documents (One per line) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Required Documents Checklist (One document per line)
              </label>
              <textarea
                rows={3}
                value={documentsText}
                onChange={(e) => setDocumentsText(e.target.value)}
                placeholder="Statement of Purpose (SOP)&#10;Official Transcripts&#10;Two Letters of Recommendation"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            {/* University Overview */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                University &amp; Academic Overview
              </label>
              <textarea
                rows={2}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Brief summary of research prestige, faculties, and programs..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* City Life Overview */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                City Life &amp; Expat Experience
              </label>
              <textarea
                rows={2}
                value={cityLifeOverview}
                onChange={(e) => setCityLifeOverview(e.target.value)}
                placeholder="Cost of living, safety, transit, student community..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Official Website URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Official Scholarship Application URL *
              </label>
              <input
                type="url"
                value={officialWebsiteUrl}
                onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
              {errors.officialWebsiteUrl && (
                <p className="mt-1 text-[11px] text-red-600">{errors.officialWebsiteUrl}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{editingScholarship ? "Save Changes" : "Create Scholarship"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
