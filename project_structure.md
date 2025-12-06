# ExposureEngine - Project Logbook & Structure

## 1. Project Overview
**ExposureEngine** is a data-driven visibility calculator for elite youth soccer players targeting college recruitment. It leverages Generative AI (Google Gemini) to analyze a player's athletic, academic, and market data to provide a realistic probability score for NCAA D1-D3, NAIA, and JUCO levels.

**Tech Stack:**
- **Frontend:** React (TypeScript), Tailwind CSS
- **AI/Backend Logic:** Google GenAI SDK (Client-side integration)
- **Visualization:** Recharts
- **Icons:** Lucide React

---

## 2. File Structure

```text
/
├── index.html                  # Entry point, Tailwind config, Font imports
├── index.tsx                   # React Root mounting
├── App.tsx                     # Main Layout, Theme State, API Orchestration
├── types.ts                    # TypeScript Interfaces (PlayerProfile, AnalysisResult, etc.)
├── constants.ts                # System Prompts, Enum Lists (Leagues, Positions)
├── metadata.json               # Project metadata
│
├── services/
│   └── geminiService.ts        # Google Gemini API integration & Error Handling
│
└── components/
    ├── Header.tsx              # Nav bar, Theme Toggle (Sun/Moon)
    ├── PlayerInputForm.tsx     # Complex multi-step data entry form
    └── AnalysisResult.tsx      # Results Dashboard (Player View & Coach View)
```

---

## 3. Detailed Feature List

### A. Core System & UX
*   **Dark/Light Mode:** Full systemic theme switching with persisted preference (`localStorage`).
*   **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop.
*   **Methodology Transparency:** "How it works" modal explaining the 4-phase algorithm.
*   **Print Optimization:** Custom CSS to generate clean, white-paper style PDFs via browser print.

### B. Input Form (`PlayerInputForm.tsx`)
*   **Data Persistence:** Autosaves user progress to `localStorage` to prevent data loss on refresh.
*   **Demo Data Loader:** Dropdown to pre-fill form with 10+ specific personas (e.g., "Blue Chip D1", "Academic Risk", "No Video").
*   **Loading State:** Animated loading screen with rotating educational facts about college recruiting.
*   **Section 1: Bio & Physical**
    *   Dynamic dropdowns for Nationality (Multi-select) and State/Region.
    *   Manual overrides for "Other" inputs.
    *   "Player Ratings": Subjective self-assessment with tooltips encouraging honesty.
*   **Section 2: Academics**
    *   GPA & Test Score inputs (GPA logic triggers academic warnings later).
*   **Section 3: Season History**
    *   Dynamic addition/removal of seasons.
    *   **League Coefficient:** Multi-select for leagues (ECNL, MLS NEXT, etc.).
    *   **Role Definition:** Specific minute-based definitions (e.g., "Starter > 70%").
    *   **Z-Index Handling:** Fixed layering issues for dropdowns inside cards.
*   **Section 4: Market Reality**
    *   **Video Type:** Granular selection (No Video vs. Raw Footage vs. Edited Reel).
    *   **Recruiting Funnel:** Inputs for Coaches Contacted, Replies, and Concrete Offers.
    *   **Privacy Disclaimer:** Explicit statement about data usage within Warubi Sports.

### C. Analysis Engine (`constants.ts` & `geminiService.ts`)
*   **Persona:** AI acts as a "Veteran Recruiting Director".
*   **4-Phase Scoring Algorithm:**
    1.  **On-Paper Baseline:** League Tier + Minutes Played.
    2.  **Athletic/Academic Filters:** GPA blockers (D3/Ivy) and Physical Benchmarks.
    3.  **Market Multiplier:** Penalties for No Video (0.6x) or Poor Outreach.
    4.  **Maturity Bonus:** Boosts for Age > 18.5 or Semi-Pro experience.
*   **Cascading Competency:** Logic ensuring D1-qualified players automatically show high visibility for NAIA/JUCO.
*   **Constraint Logic:** Identification of High/Medium/Low severity risks.

### D. Results Dashboard (`AnalysisResult.tsx`)
*   **View Toggle:** Switch between "Player View" (Detailed) and "Coach View" (Summary).
*   **Coach View:**
    *   "Internal Scouting Note" (Simulated database entry).
    *   "Athletic Ceiling" classification (e.g., Elite National).
    *   Simplified Linear Progress Bars.
*   **Player View:**
    *   **Executive Summary:** Plain language overview.
    *   **Player Readiness Pillars:** 5-Card Grid (Physical, Technical, Tactical, Exposure, Academic) with status labels (Developing/Competitive/Elite).
    *   **Visibility Profile:** Radar Chart showing the "Shape" of the recruit across 5 divisions.
    *   **Probability Grid:** Box grid showing High/Low probability + Scholarship Context (e.g., "Academic Aid Only" for D3).
    *   **Reality Check:** Comparative Vertical Bar Charts (User vs. Market Benchmarks) for Physical, Resume, and Academics.
    *   **Recruiting Funnel:** Visualization of Outreach -> Interest -> Results.
    *   **Performance Constraints:** List of blockers and optimizations.
    *   **90-Day Game Plan:**
        *   **Video Injection:** Logic forces a video optimization task to the top of the list.
        *   **International Suggestion:** Logic conditionally suggests international development if experience is low.
        *   Impact Badges (High/Med/Low).
*   **Call to Actions:**
    *   **Elite Pathways:** Upsell to Warubi Sports services (College, Int'l, Pro).
    *   **Save Report:** Print/PDF functionality.
    *   **Email Report:** Simulated modal to send results.
    *   **Feedback Loop:** Beta disclaimer with mailto link.

---

## 4. Key Logic & Algorithms

**1. The Video Binary:**
The system heavily weights the `videoType` field.
- `None`: 0.6x Multiplier (Severe Penalty)
- `Raw`: 0.8x Multiplier
- `Edited`: 1.0x Multiplier

**2. The D3 Financial Trap:**
Logic distinguishes between "Roster Spot" and "Financial Viability".
- High Athletic + Low GPA = High Athletic Score but Low **Market Access** for D3 (due to lack of scholarship money).

**3. Elite League Exception:**
Bench players in Elite Leagues (MLS NEXT) are penalized less for lower divisions (D2/D3) than bench players in lower leagues, acknowledging the higher training standard.

**4. Cascading Competency:**
If `D1 Score > 80`, the system automatically floors `NAIA` and `JUCO` scores at high levels, preventing illogical results where a D1 player looks "bad" for NAIA.
