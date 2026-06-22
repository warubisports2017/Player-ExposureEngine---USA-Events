@~/.claude/CLAUDE.md
@~/.claude/ECOSYSTEM.md

# Exposure Engine

## About
AI-powered visibility calculator for elite youth soccer players targeting US college recruitment. Players input their profile and get realistic visibility scores, readiness assessments, and a 90-day optimization plan.

## Supabase
- Project: Warubi Sports
- ID: jeniqwziqenuplvlnely
- Region: us-east-1

## Vercel
- App: exposureengine
- Prod URL: https://app.warubi-sports.com (canonical, custom domain)
- Default vercel domain: https://exposure-engine-olive.vercel.app (the bare `exposure-engine.vercel.app` is a DIFFERENT Next.js app - not this repo)
- Project ID: prj_FcZ0vQHYmOPcphy4knv8Peocq0nI
- Deploy: `vercel --prod` (CLI). main is review-protected (PROD-SAFE hook blocks direct push) - land changes via PR.

## Stack
- React 19 + Vite 6 + TypeScript
- Tailwind CSS 4 (dark/light theme)
- Google Gemini API (via Vercel serverless `/api/analyze.ts`)
- Recharts 3.5 (bar charts, benchmarks)
- jsPDF + html2canvas-pro (PDF export, dynamically imported)
- No auth — public-facing app, Supabase anon key only

## Key Files
- `App.tsx` — Main layout, theme state, analysis orchestration
- `components/PlayerInputForm.tsx` — Multi-section form (62KB), localStorage autosave, demo data
- `components/AnalysisResult.tsx` — Results dashboard (62KB), Player/Coach view toggle, PDF export
- `api/analyze.ts` — Vercel serverless function with Gemini system prompt (26KB)
- `services/geminiService.ts` — Client-side Gemini integration + deterministic readiness calc
- `services/supabase.ts` — Supabase client (fire-and-forget lead saves)
- `types.ts` — All TypeScript interfaces
- `constants.ts` — Leagues, positions, levels, athletic ratings

## Key Tables / cross-project writes (verified 2026-06-21)
- `website_leads` (this project, jeniqwziqenuplvlnely) — Player submissions. Email present -> `upsert_website_lead` RPC + `sync-lead-to-brevo`. No email -> plain insert, no Brevo. Carries `referral_source` from `?ref=`.
- `profiles` — legacy/future.
- **Feedback widget** writes to `feedback` in **Warubi Core wwomwawpxmkrykybpqok** (api/feedback.ts uses AUSA_URL via `submit_external_feedback` RPC). NB: this is the SAME table the session-brief reads - test feedback shows up there.
- **Scout referral** (`?ref=<scout uuid>`) inserts `scout_prospects` in **ITP project umblyhwumtadlvgccdwg** (SCOUT_SUPABASE_URL, service role, inline in api/analyze.ts). `scout_id` is a NOT NULL uuid - a non-uuid ref is silently skipped (safe by design).

## Architecture Notes
- **Deterministic scoring**: Visibility score floors are hardcoded by league tier/gender in `api/analyze.ts` — prevents LLM underscoring
- **Verification Gap**: Dual readiness scores (Your Rating vs Verified Level) with gap callout
- **Self-assessment cap**: Athletic ratings capped by league tier to prevent inflation
- **Fire-and-forget**: Lead saves to Supabase don't block UI. Edge function `sync-lead-to-brevo` syncs to email CRM
- **System prompt in serverless only**: Lives in `api/analyze.ts`, not shared with client (Vercel bundler can't resolve cross-dir TS imports)
- **Dynamic imports**: Supabase, jsPDF, html2canvas loaded on demand to reduce bundle

## Gotchas
- Mobile GPU lag from `blur-[120px]` — hide decorative blurs on mobile (`hidden md:block`)
- Vercel serverless can't resolve cross-directory TypeScript imports from Vite — inline shared constants in `api/analyze.ts`
- GPA field uses `type="text"` + `inputMode="decimal"` (not `type="number"`) — see React controlled input rejection pattern
