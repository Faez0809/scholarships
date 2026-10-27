# ScholarTrack

ScholarTrack is a clean, modern web application designed to discover, filter, and manage fully funded Master's and PhD scholarships worldwide. It features real-time eligibility matching against academic profiles, net living savings calculations, multi-university umbrella program support, supervisor RA/TA funding guides, cloud synchronization with Supabase, and automated webpage data extraction.

---

## Features

- **Dynamic Academic Profile Matching**: Set your target degree, major/field, CGPA (4.0 scale), IELTS band, and medium of instruction to see instantaneous eligibility match badges across every scholarship.
- **World Regions & Umbrella Programs**: Filter across Europe, Asia, Americas, Oceania, and Middle East. Explore government umbrella programs (CSC China, Erasmus Mundus, DAAD) with multi-university city savings breakdowns.
- **Supervisor & RA/TA Research Tracks**: Dedicated guidance and email outreach protocols for university programs where funding is secured directly via professor research lab grants (e.g. Waterloo, Georgia Tech, Melbourne).
- **Financial & Savings Breakdown**: Compare monthly stipends against estimated local living costs, highlighting net monthly savings and factoring in on-campus housing allowances.
- **Interactive Living Cost Calculator**: Adjust your personal monthly budget inside each scholarship's slide-over details panel to see tailored net savings projections.
- **Required Documents Checklist**: Track required application documents (SOP, LORs, transcripts, CV, language tests) with persistent progress state.
- **Classification & Quick Filters**: Filter scholarships by Master's Only, PhD Only, 100% Eligible for My Profile, High Net Savings (>$300/mo), and Closing Soon.
- **Live Supabase Cloud Database Sync**: Fully connected with Supabase PostgreSQL cloud storage. Changes made by administrators sync across clients in real-time, backed by automatic initial seed data and seamless offline fallback.
- **100% Mobile Responsive**: Optimized for phone browsers with collapsible filter drawer, edge-to-edge touch swiping on regions and filter pills, compact card grids, and responsive slide-over panels.
- **Admin Management & Instant URL Auto-Import**: Protected admin panel to create, edit, and delete scholarships. Includes an automated URL parser that extracts criteria directly from official scholarship websites.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase PostgreSQL with JSONB document storage & Row-Level Security
- **Icons**: Lucide Icons
- **State Management**: React Context with LocalStorage caching and cloud synchronization

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

Set your Supabase credentials, parser key, and admin passcode in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
ADMIN_PIN=1234
```

### 4. Supabase Database Setup
Execute the SQL statements provided in `supabase-schema.sql` inside your Supabase project's SQL Editor to create the `scholarships` table and set up Row Level Security policies:

```bash
# See supabase-schema.sql for the complete SQL schema
```

*Note: If the Supabase table has not been created yet or the database is temporarily unreachable, ScholarTrack automatically falls back to local seed data so the application never crashes.*

### 5. Running the Development Server
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
│   │   │   ├── extract-scholarship/  # Web scraping & structured data parsing API
│   │   │   └── scholarships/         # Supabase cloud CRUD & auto-seeding API
│   │   ├── globals.css               # Global theme & typography styles
│   │   ├── layout.tsx                # App root layout with SEO metadata & viewport
│   │   └── page.tsx                  # Home application entry
│   ├── components/
│   │   ├── AdminModal.tsx            # Add/Edit form & URL auto-import interface
│   │   ├── FilterPills.tsx           # Category pills and sorting dropdown
│   │   ├── Navbar.tsx                # Top navigation and cloud sync status
│   │   ├── PasscodeModal.tsx         # Admin PIN authentication modal
│   │   ├── ProfileSidebar.tsx        # Academic profile filter inputs (mobile collapsible)
│   │   ├── ScholarshipApp.tsx        # Main application layout orchestrator
│   │   ├── ScholarshipCard.tsx       # Decision metric cards
│   │   ├── ScholarshipDrawer.tsx     # Slide-over detailed view & calculator
│   │   └── WorldRegionBar.tsx        # Horizontal touch-scroll world regions bar
│   ├── context/
│   │   └── ScholarshipContext.tsx    # State management, LocalStorage, & Supabase sync
│   ├── data/
│   │   └── seedScholarships.ts       # 12 comprehensive global seed programs
│   ├── lib/
│   │   └── supabase.ts               # Supabase client initialization
│   ├── types/
│   │   └── scholarship.ts            # Core TypeScript interfaces
│   └── utils/
│       └── scholarshipUtils.ts       # Eligibility scoring & sorting logic
├── public/                           # Static assets
├── supabase-schema.sql               # PostgreSQL schema & RLS policies
├── .env.example                      # Environment variables template
├── next.config.ts                    # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## License

MIT License. Developed by [Faez0809](https://github.com/Faez0809).
