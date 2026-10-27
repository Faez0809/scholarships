# ScholarTrack

ScholarTrack is a clean, modern web application designed to discover, filter, and manage fully funded Master's and PhD scholarships worldwide. It features real-time eligibility matching against academic profiles, net living savings calculations, and an automated scholarship webpage extractor.

---

## Features

- **Dynamic Academic Profile Matching**: Set your target degree, major/field, CGPA (4.0 scale), IELTS band, and medium of instruction to see instantaneous eligibility match badges on every scholarship.
- **Financial & Savings Breakdown**: Compare monthly stipends against estimated local living costs, highlighting net monthly savings and factoring in on-campus housing allowances.
- **Interactive Living Cost Calculator**: Adjust your personal monthly budget inside each scholarship's slide-over details panel to see tailored net savings projections.
- **Required Documents Checklist**: Track required application documents (SOP, LORs, transcripts, CV, language tests) with persistent progress state.
- **Classification & Quick Filters**: Filter scholarships by Master's Only, PhD Only, 100% Eligible for My Profile, High Net Savings (>$300/mo), and Closing Soon.
- **Admin Management & Auto-Extractor**: Protected admin panel to create, edit, and delete scholarships. Includes an automated URL extractor that parses official scholarship web pages and populates all criteria directly into the system.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Extraction**: Google Gemini API via `@google/genai`
- **State Management**: React Context with LocalStorage persistence

---

## Getting Started

### 1. Prerequisites
- Node.js 18.18+ or later
- npm or pnpm

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Faez0809/scholarships.git
cd scholarships
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your Gemini API key and admin passcode in `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_PIN=1234
```

### 4. Running the Development Server
Start the local server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
scholarships/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── extract-scholarship/  # Web scraping & structured extraction API
│   │   ├── globals.css               # Global theme & custom scrollbar styles
│   │   ├── layout.tsx                # App root layout with SEO metadata
│   │   └── page.tsx                  # Home application entry
│   ├── components/
│   │   ├── AdminModal.tsx            # Add/Edit form & URL extractor interface
│   │   ├── FilterPills.tsx           # Category pills and sorting dropdown
│   │   ├── Navbar.tsx                # Top navigation and quick statistics
│   │   ├── PasscodeModal.tsx         # Admin PIN authentication modal
│   │   ├── ProfileSidebar.tsx        # Academic profile filter inputs
│   │   ├── ScholarshipApp.tsx        # Main application layout orchestrator
│   │   ├── ScholarshipCard.tsx       # Decision metric cards
│   │   └── ScholarshipDrawer.tsx     # Slide-over detailed view & calculator
│   ├── context/
│   │   └── ScholarshipContext.tsx    # State management & LocalStorage sync
│   ├── data/
│   │   └── seedScholarships.ts       # Initial global scholarship dataset
│   ├── types/
│   │   └── scholarship.ts            # Core TypeScript interfaces
│   └── utils/
│       └── scholarshipUtils.ts       # Eligibility scoring & sorting logic
├── public/                           # Static assets
├── .env.example                      # Environment variables template
├── next.config.ts                    # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## License

MIT License. Developed by [Faez0809](https://github.com/Faez0809).
