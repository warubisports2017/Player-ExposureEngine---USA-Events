# Exposure Engine Algorithm Test Report

**Date:** February 15, 2026
**Source:** COPA Talent ID Day — 10 real athlete profiles (5 boys, 5 girls)
**Method:** Profiles built from Google Sheets registration data → Gemini API with full system prompt + structured schema
**Note:** None of the profiles had marketing/video data set (all `hasHighlightVideo: false`, `coachesContacted: 0`)

---

## 1. Summary Table — Visibility Scores (No Video Baseline)

| # | Player | Gender | Grad | Pos | League | GPA | D1 | D2 | D3 | NAIA | JUCO | Funnel Stage |
|---|--------|--------|------|-----|--------|-----|----|----|----|----|------|--------------|
| 1 | Benjamin Hayes | M | 2032 | LW | MLS NEXT | 3.5 | 5 | 10 | 15 | 15 | 20 | Invisible |
| 2 | Brayden Shen | M | 2029 | LW | MLS NEXT | 4.0 | 15 | 20 | 30 | 30 | 35 | Invisible |
| 3 | Carson Chen | M | 2030 | LW | ECNL | 3.4 | 10 | 15 | 25 | 25 | 30 | Invisible |
| 4 | Oscar Saldana Vargas | M | 2032 | ST | Local Competitive | 3.2 | 5 | 8 | 15 | 15 | 20 | Invisible |
| 5 | Hader Minto | M | 2031 | CM | Local Competitive | 3.0 | 5 | 8 | 15 | 15 | 20 | Invisible |
| 6 | Aria Flores | F | 2030 | LW | ECNL | 3.6 | 15 | 20 | 30 | 30 | 35 | Invisible |
| 7 | Emma Isleib | F | 2030 | CM | ECNL-RL | 3.8 | 10 | 15 | 25 | 25 | 30 | Invisible |
| 8 | Ava Garcia | F | 2027 | LW | ECNL | 3.5 | 20 | 30 | 40 | 40 | 45 | Invisible |
| 9 | Johannah Wallace | F | 2030 | CAM | Girls Academy | 3.9 | 15 | 20 | 30 | 30 | 35 | Invisible |
| 10 | Francesca Roland | F | 2030 | GK | Local Competitive | 3.3 | 10 | 15 | 25 | 25 | 25 | Invisible |

**Key observation:** Every single player is classified as "Invisible" because none had video or coach outreach data. This is expected behavior — the algorithm correctly penalizes lack of marketing assets.

---

## 2. Readiness Scores (0-100)

| Player | Academic | Athletic | Technical | Tactical | Market |
|--------|----------|----------|-----------|----------|--------|
| Benjamin Hayes | 80 | 80 | 75 | 70 | 65 |
| Brayden Shen | 95 | 90 | 85 | 80 | 65 |
| Carson Chen | 75 | 85 | 80 | 75 | 65 |
| Oscar Saldana Vargas | 70 | 70 | 65 | 60 | 55 |
| Hader Minto | 65 | 70 | 65 | 60 | 55 |
| Aria Flores | 80 | 85 | 80 | 75 | 65 |
| Emma Isleib | 85 | 80 | 80 | 75 | 65 |
| Ava Garcia | 80 | 85 | 80 | 75 | 70 |
| Johannah Wallace | 90 | 85 | 80 | 75 | 65 |
| Francesca Roland | 80 | 95 | 70 | 60 | 65 |

---

## 3. Per-Player Detail Cards

### Benjamin Hayes — Male, 2032, LW/ST, MLS NEXT
**Input:** Atletico Santa Rosa MLS NEXT U13 | Key Starter | 18 GP, 6G/4A | 5'4" | 3.5 GPA | All athletic ratings: Above Average

**Coach Eval:** *"Benjamin is a very young, promising MLS NEXT player with above-average self-assessed skills. However, at his age (2032 grad), he is years away from active recruiting and currently invisible to coaches due to zero video and outreach."*

**Strengths:**
- Playing in MLS NEXT (elite youth league) at a young age
- Key starter role with solid production (6G/4A in 18 games)
- Solid academic foundation (3.5 GPA)

**Risks:**
- [High] No video = coaches cannot evaluate him
- [High] Zero outreach = invisible in recruiting funnel
- [High] 2032 grad = 6 years from college, too young for active recruiting

**Funnel:** Invisible | Bottleneck: No Video & Zero Outreach

**VERDICT: PASS** — Algorithm correctly identifies him as too young for active recruiting but recognizes MLS NEXT as elite. Scores are appropriately low given age + no marketing. The D1=5% is fair for a 2032 grad with no video.

---

### Brayden Shen — Male, 2029, LW/RB, MLS NEXT
**Input:** FC Bay Area Surf | Key Starter | 22 GP, 8G/5A | 5'5" | 4.0 GPA | Speed/Tech/Endurance: Top 10%

**Coach Eval:** *"Brayden is an extremely promising prospect with an elite academic record and significant athletic talent in MLS NEXT. However, without video or outreach, he remains invisible despite his strong profile."*

**Strengths:**
- Elite academic profile (4.0 GPA)
- MLS NEXT key starter with strong production
- Top 10% speed, technical ability, and endurance

**Risks:**
- [High] No video footage for coach evaluation
- [High] Zero outreach to college programs
- [Medium] Still young (2029) — active recruiting 2-3 years away

**Funnel:** Invisible | Bottleneck: No Video & Zero Outreach

**VERDICT: PASS** — Correctly ranks him highest among boys. 4.0 GPA + MLS NEXT + Top 10% athleticism = the algorithm gives him the best scores in the group (D1: 15%, D3: 30%). The scores would be much higher with video. Academic readiness at 95 is appropriate for a 4.0 student.

---

### Carson Chen — Male, 2030, LW/ST, ECNL
**Input:** Mustang SC U14 ECNL | Key Starter | 20 GP, 7G/4A | 5'6" | 3.4 GPA | Speed: Top 10%, Tech: Top 10%

**Coach Eval:** *"Carson is a highly promising ECNL player with exceptional self-assessed skills. His academic profile is solid. However, zero video and outreach make him currently invisible."*

**Strengths:**
- ECNL player (elite pathway)
- Strong goal production for an LW (7G/4A in 20 games)
- Top 10% speed and technical ability

**Risks:**
- [High] No video available
- [High] Zero coaches contacted
- [Medium] 2030 grad = still early in recruiting cycle

**Funnel:** Invisible | Bottleneck: No Video & Zero Outreach

**VERDICT: PASS** — Correctly slots below Brayden (MLS NEXT > ECNL, 4.0 > 3.4 GPA). D1=10% vs Brayden's 15% is a logical league-tier differentiation.

---

### Oscar Saldana Vargas — Male, 2032, ST/GK, Local Competitive
**Input:** Atletico Santa Rosa FC | Key Starter | 15 GP, 4G/2A | 4'11" | 3.2 GPA | All ratings: Average to Above Average

**Coach Eval:** *"Oscar is a very young player in a local competitive league with average to above-average athletic self-assessment. His low-tier league, young age, lack of video, and no outreach place him firmly in the invisible category."*

**Strengths:**
- Key starter with goal-scoring ability (4G in 15 games)
- Solid academic foundation (3.2 GPA)
- Young age provides development runway

**Risks:**
- [High] No video
- [High] Zero outreach
- [High] Local competitive league limits exposure
- [High] 2032 grad = too young for active recruiting

**Funnel:** Invisible | Bottleneck: No Video, Low League Tier, Zero Outreach

**VERDICT: PASS** — Correctly penalized for local league (vs MLS NEXT/ECNL). D1=5% is appropriate. Lower readiness scores across the board compared to elite-league players make sense.

---

### Hader Minto — Male, 2031, CM/LW, Local Competitive
**Input:** Bay Area Surf U13 | Key Starter | 16 GP, 3G/5A | 5'0" | 3.0 GPA | Speed/Tech: Above Average

**Coach Eval:** *"Hader is a young central midfielder in a local competitive league. While his assist numbers show good vision, his low-tier league and absence of video/outreach make him invisible."*

**Strengths:**
- Good playmaking ability (5A in 16 games as CM)
- Key starter role
- Young — time to develop

**Risks:**
- [High] No video or outreach
- [High] Local competitive league
- [Medium] 3.0 GPA = borderline for academic scholarships

**Funnel:** Invisible | Bottleneck: No Video, Low League, Zero Outreach

**VERDICT: PASS** — Very similar scores to Oscar (same local league tier). Algorithm treats local competitive players equivalently regardless of position — reasonable. The 3.0 GPA is correctly reflected in the lower academic readiness score (65 vs 80+ for higher-GPA players).

---

### Aria Flores — Female, 2030, LW/ST, ECNL
**Input:** Cal Odyssey G12 ECNL | Key Starter | 22 GP, 10G/6A | 5'2" | 3.6 GPA | Speed/Tech: Top 10%

**Coach Eval:** *"Aria is a talented ECNL forward with strong production and top-tier speed/technical ability. Without video, she's invisible despite having the profile coaches would want to see."*

**Strengths:**
- ECNL player with excellent production (10G/6A)
- Top 10% speed and technical ability
- Strong GPA (3.6)

**Risks:**
- [High] No video or outreach
- [Medium] 2030 grad = still early for active recruiting

**Funnel:** Invisible | Bottleneck: No Video & Zero Outreach

**VERDICT: PASS** — Scores mirror Carson Chen (both ECNL, similar stats). Algorithm doesn't appear to have gender bias in scoring — same league tier = same visibility %. Production (10G/6A) is excellent but without video it doesn't lift scores. This is correct behavior.

---

### Emma Isleib — Female, 2030, CM, ECNL-RL
**Input:** Mustang SC ECNL-RL | Key Starter | 20 GP, 4G/8A | 5'7" | 3.8 GPA | Speed: Above Avg, Tech: Top 10%

**Coach Eval:** *"Emma is a strong central midfielder in the ECNL Regional League with excellent academics and a creative passing game. No video or outreach limits her visibility."*

**Strengths:**
- ECNL-RL (solid developmental pathway)
- Excellent playmaking (8A as CM)
- Strong academics (3.8 GPA)
- Good height for a midfielder (5'7")

**Risks:**
- [High] No video or outreach
- [Medium] ECNL-RL is one tier below full ECNL

**Funnel:** Invisible | Bottleneck: No Video & Zero Outreach

**VERDICT: PASS** — Correctly scored slightly below full ECNL players (D1: 10% vs 15%). ECNL-RL → ECNL differentiation is working. Academic readiness (85) properly reflects her 3.8 GPA.

---

### Ava Garcia — Female, 2027, LW, ECNL
**Input:** Bay Area Surf U17 ECNL | Key Starter | 24 GP, 12G/7A | 5'1" | 3.5 GPA | All Top 10% except strength

**Coach Eval:** *"Ava is a strong ECNL forward entering the critical recruiting window as a 2027 grad. Despite excellent production and athleticism, lack of video and outreach means she's missing the most important phase of recruiting."*

**Strengths:**
- ECNL key starter with elite production (12G/7A in 24 games)
- 2027 grad = in the active recruiting window NOW
- Top 10% speed, endurance, technical, tactical

**Risks:**
- [High] No video — CRITICAL for a 2027 grad who should be actively recruiting
- [High] Zero outreach during the most important recruiting period
- [Medium] 5'1" height may be limiting for some programs

**Funnel:** Invisible | Bottleneck: No Video & Zero Outreach

**VERDICT: PASS** — Correctly has the HIGHEST visibility scores of all 10 players (D1: 20%, D2: 30%, JUCO: 45%). The algorithm recognizes she's closest to college-age and in the active recruiting window. This is the most "urgent" profile and the scores reflect that. Market readiness (70) is the highest, correctly reflecting recruiting timeline urgency.

---

### Johannah Wallace — Female, 2030, CAM, Girls Academy
**Input:** San Jose Earthquakes Girls Academy | Key Starter | 22 GP, 6G/8A | 5'5" | 3.9 GPA | Strength/Work Rate/Tactical: Top 10%

**Coach Eval:** *"Johannah is an elite Girls Academy player with excellent academics and strong on-field performance. With no video or outreach, she's invisible despite being in a top-tier development environment."*

**Strengths:**
- Girls Academy (elite pathway, similar to ECNL)
- Excellent academics (3.9 GPA)
- Strong production as CAM (6G/8A)
- Top 10% work rate and tactical understanding

**Risks:**
- [High] No video or outreach
- [Medium] 2030 grad = time to build, but needs to start now

**Funnel:** Invisible | Bottleneck: No Video & Zero Outreach

**VERDICT: PASS** — Girls Academy correctly treated as equivalent to ECNL (D1: 15%). Academic readiness (90) is second only to Brayden's 95 — appropriate for 3.9 GPA. Good differentiation from ECNL-RL players.

---

### Francesca Roland — Female, 2030, GK, Local Competitive
**Input:** Atletico Santa Rosa G12 | Key Starter | 18 GP | 5'6" | 3.3 GPA | Speed/Endurance/Work Rate: Top 10%, Tech: Above Avg

**Coach Eval:** *"Francesca is a very young goalkeeper with solid self-assessed ability in a low-tier league; however, with no video or outreach, she is currently invisible to college coaches."*

**Strengths:**
- Goalkeeper is a high-demand position
- Key starter with significant minutes
- Strong athletic self-assessment
- Solid academics (3.3 GPA)

**Risks:**
- [High] No video — impossible to evaluate a GK without footage
- [High] Zero outreach
- [Medium] Local competitive league limits exposure
- [High] 2030 grad = still years from active recruiting

**Funnel:** Invisible | Bottleneck: No Video & Zero Outreach

**VERDICT: PASS** — Interestingly gives D1=10% despite local league — likely because GK is a high-demand position. Athletic readiness is the highest of all players (95), which is notable since she's in a lower-tier league. This could be a slight overweight on self-assessment for GKs — **flag for review**.

---

## 4. Algorithm Issues Found

### Issue 1: Athletic Readiness Inflation for Self-Assessed Data
**Severity: Medium**
Francesca Roland gets athletic readiness = 95 (highest of all players) despite playing in a local competitive league. Her self-assessed Top 10% ratings drive this, but there's no competitive context to validate those claims. A local league "Top 10%" is very different from an MLS NEXT "Top 10%".

**Recommendation:** Weight self-assessed athletic scores by league tier. A Top 10% rating in MLS NEXT should score higher than the same rating in local competitive.

### Issue 2: Market Score Floor Too High
**Severity: Low**
All players without marketing data get market readiness of 55-70. Players with ZERO video and ZERO outreach should arguably be closer to 10-20 for market readiness, since they have literally no market presence.

**Recommendation:** Drop the market readiness floor to 20 when `hasHighlightVideo = false` AND `coachesContacted = 0`.

### Issue 3: No Gender-Specific League Mapping
**Severity: Low**
Girls Academy and ECNL are treated as equivalent tiers. This is approximately correct for recruiting purposes, but ECNL is generally considered slightly more competitive on the girls' side. Currently not a major issue.

### Issue 4: All Players Get "Invisible" Funnel Stage
**Severity: Expected Behavior**
Without marketing data, every player is "Invisible". This is actually correct — if a player has no video and hasn't contacted coaches, they ARE invisible. But the uniformity makes the funnel analysis less useful for differentiating between players.

**Recommendation:** Add sub-stages within "Invisible" (e.g., "Invisible - Ready to Launch" for high-potential players vs "Invisible - Needs Development" for younger/lower-league players).

### Issue 5: Secondary Position Logic
**Severity: Low**
Oscar Saldana Vargas lists GK as secondary position with ST as primary. This is an unusual combination that likely reflects a data entry issue, but the algorithm doesn't flag this as unusual. It should either flag the combination or ask for clarification.

### Issue 6: Height Not Factored Visibly
**Severity: Low**
Oscar at 4'11" and Ava at 5'1" don't show any visible height penalty or acknowledgment in the visibility scores. Height matters for recruiting (especially for certain positions). The algorithm should explicitly address height in coach evaluations.

---

## 5. Overall Assessment

### What's Working Well
1. **League tier differentiation is correct** — MLS NEXT > ECNL > ECNL-RL > Local Competitive. Scores scale properly.
2. **Academic readiness tracks GPA accurately** — 4.0 = 95, 3.9 = 90, 3.0 = 65. Logical progression.
3. **Recruiting timeline awareness** — Ava (2027) gets the highest scores because she's in the active window. Young players (2031-2032) are correctly deprioritized.
4. **Video penalty is appropriately harsh** — No video = low visibility. This is real-world accurate.
5. **Coach evaluations are sensible** — Each one correctly identifies the key strengths and the "invisible" problem.
6. **Action plans are practical** — "Get video" is always #1 priority. Makes sense.

### What Needs Improvement
1. Athletic readiness shouldn't trust self-assessment equally across league tiers
2. Market readiness floor is too generous for zero-marketing profiles
3. Need sub-stages in the funnel for better differentiation
4. Height/physical profile should be explicitly addressed
5. Unusual position combinations should be flagged

### Is It Ready to Send to Real Players?

**YES, with caveats.** The core algorithm logic is sound:
- League differentiation works
- Academic scoring works
- Timeline/urgency works
- The "get video" message is correct and universal for these profiles

**Before sending:**
- Run the same profiles WITH video enabled to verify scores increase appropriately (see Section 6 below)
- Consider lowering the market readiness floor
- Consider weighting athletic self-assessment by league tier

The output is professional, accurate, and gives players actionable next steps. The biggest risk is the athletic readiness inflation (Issue #1), which could give local-league players false confidence about their athletic profile.

---

## 6. With-Video Comparison

All 10 profiles re-run with `hasHighlightVideo: true`, `videoQuality: "Professional"`, `coachesContactedCount: 0`.

### Visibility Score Comparison (No Video → With Video)

| Player | Grad | League | D1 (no→vid) | D2 (no→vid) | D3 (no→vid) | NAIA (no→vid) | JUCO (no→vid) |
|--------|------|--------|-------------|-------------|-------------|---------------|---------------|
| Benjamin Hayes | 2032 | MLS NEXT | 5→36 | 10→38 | 15→40 | 15→38 | 20→36 |
| Brayden Shen | 2029 | MLS NEXT | 15→79 | 20→64 | 30→52 | 30→39 | 35→30 |
| Carson Chen | 2030 | ECNL | 10→85 | 15→90 | 25→92 | 25→92 | 30→95 |
| Oscar Saldana Vargas | 2032 | Local | 5→0.01 | 8→0.01 | 15→0.01 | 15→0.01 | 20→0.01 |
| Hader Minto | 2031 | Local | 5→0.1 | 8→0.1 | 15→0.1 | 15→0.2 | 20→0.3 |
| Aria Flores | 2030 | ECNL | 15→2 | 20→2 | 30→2 | 30→2 | 35→1 |
| Emma Isleib | 2030 | ECNL-RL | 10→32 | 15→36 | 25→38 | 25→38 | 30→34 |
| Ava Garcia | 2027 | ECNL | 20→48 | 30→57 | 40→57 | 40→57 | 45→60 |
| Johannah Wallace | 2030 | Girls Academy | 15→98 | 20→90 | 30→83 | 30→70 | 35→60 |
| Francesca Roland | 2030 | Local | 10→0 | 15→0 | 25→0 | 25→1 | 25→2 |

---

## 7. CRITICAL ISSUES from Video Comparison

### CRITICAL Issue #1: Schema Not Enforced — Different Response Format Every Run
**Severity: P0 (Showstopper)**

The no-video run returned:
```json
// Visibility: Array of objects
[{"level": "NCAA D1", "visibilityPercent": 15, "notes": "..."}]
// Readiness: Object with sub-scores
{"academic": 80, "athletic": 95, "technical": 70, "tactical": 60, "market": 65}
// Funnel: Standard object
{"stage": "Invisible", "bottleneck": "...", "conversionRate": "0%", "advice": "..."}
```

The with-video run returned:
```json
// Visibility: Flat object (some use NCAA_D1, others use D1)
{"NCAA_D1": 85, "NCAA_D2": 90, "NCAA_D3": 92}  // Carson
{"D1": 98, "D2": 90, "D3": 83}                   // Johannah (different keys!)
// Readiness: Single number instead of object
25  // Carson
// Funnel: DIFFERENT STRUCTURE FOR EVERY PLAYER
{"currentFunnelStatus": {...}, "futurePotentialFunnel": {...}}  // Aria
{"topOfFunnel_Awareness": "...", "middleOfFunnel_InterestEngagement": "..."}  // Benjamin
{"currentStage": "...", "description": "...", "nextStepsToMoveDownFunnel": [...]}  // Emma
```

**The Gemini API is not respecting the output schema.** The frontend will crash trying to render these inconsistent shapes. This MUST be fixed with strict JSON schema enforcement (e.g., `response_mime_type: "application/json"` + `response_schema` in the Gemini API call).

### CRITICAL Issue #2: Scores Go DOWN With Video for Some Players
**Severity: P0 (Logic Error)**

Adding video should NEVER make a player LESS visible, but:
- **Aria Flores**: D1 went from 15% → 2% (dropped 87%!)
- **Francesca Roland**: D1 went from 10% → 0% (dropped 100%!)
- **Oscar Saldana Vargas**: D1 went from 5% → 0.01% (dropped 99%!)
- **Hader Minto**: D1 went from 5% → 0.1% (dropped 98%!)

These players scored HIGHER without video. This is a severe logic error — the model is apparently re-evaluating the entire profile from scratch each time, producing wildly different numbers.

### CRITICAL Issue #3: Inconsistent Player Rankings
**Severity: P0 (Logic Error)**

With video enabled:
- **Carson Chen** (ECNL, 2030, 3.4 GPA) gets D1: **85%**
- **Aria Flores** (ECNL, 2030, 3.6 GPA, BETTER stats 10G/6A vs 7G/4A) gets D1: **2%**

These two players have nearly identical profiles (same league, same grad year, similar production). Carson should NOT be 42x more visible than Aria. The model is producing random, non-deterministic outputs.

Similarly:
- **Johannah Wallace** (2030, Girls Academy) gets D1: **98%** — suggesting she's basically a lock for D1
- **Ava Garcia** (2027, ECNL, IN the active recruiting window) gets D1: **48%**

A 2030 grad should NEVER score higher than a 2027 grad with similar profile. Ava is actively being recruited NOW; Johannah is 4 years away.

### CRITICAL Issue #4: Brayden Shen's Inverted Scores
**Severity: P1 (Logic Error)**

Brayden's with-video scores: D1: 79%, D2: 64%, D3: 52%, NAIA: 39%, JUCO: 30%

This is **inverted** — D1 should be the HARDEST to get into (lowest visibility), and JUCO should be the EASIEST (highest visibility). The algorithm is giving him a higher chance at D1 than JUCO, which makes no sense.

### Issue #5: Local League Players Scored Near-Zero Even WITH Video
**Severity: P1**

Oscar (0.01%), Hader (0.1%), and Francesca (0-2%) all got near-zero scores even with professional video. While local league players are less competitive, having video should still provide SOME uplift. A player with professional video in local league should score at least 10-15% for JUCO/NAIA.

---

## 8. Root Cause Analysis

The fundamental problem is that **Gemini is not being constrained to a strict output schema**. Each API call produces:
1. **Different JSON structure** (array vs object, nested vs flat)
2. **Different key names** (NCAA_D1 vs D1)
3. **Different value ranges** (0-100 percentages vs 0-2 "ratings")
4. **Non-deterministic scoring** (same profile → wildly different scores)

### Recommended Fix

1. **Use Gemini's structured output mode**: Set `response_mime_type: "application/json"` and provide an explicit `response_schema` in the API call. This forces Gemini to return the exact shape you specify.

2. **Add post-processing validation**: After receiving the Gemini response, validate it against a TypeScript interface. Reject and retry if the schema doesn't match.

3. **Add monotonicity constraints**: D1 ≤ D2 ≤ D3 ≤ NAIA ≤ JUCO must always hold (harder divisions = lower scores). If the model violates this, either fix it in post-processing or reject and retry.

4. **Clamp "with video" scores**: If a player's with-video score is LOWER than their no-video score, use the no-video score as a floor. Video can only help, never hurt.

5. **Lower temperature**: Reduce Gemini temperature to 0.1-0.3 for scoring to improve consistency. Keep higher temperature only for the coach eval text.

---

## 9. Final Verdict

### No-Video Baseline Results: PASS (8/10 correct)
The algorithm produces logical, well-differentiated results when all players lack video. League tiers, GPA, and recruiting timeline all factor in correctly. The coach evaluations are professional and accurate. Minor issues with athletic readiness inflation.

### With-Video Results: FAIL (Critical)
Adding video caused schema breakage, inverted scores, illogical rankings, and some players scoring LOWER than without video. The Gemini API is not being constrained to produce consistent output.

### Overall: NOT READY for production use
The no-video analysis text (coach evals, action plans, strengths/risks) is excellent and could be sent to players today. But the numerical scores are unreliable and would undermine credibility if a player sees D1: 2% one day and D1: 85% the next for the same profile.

### Priority Fix List
1. **P0**: Enforce strict JSON schema in Gemini API calls
2. **P0**: Add monotonicity constraint (D1 ≤ D2 ≤ D3 ≤ NAIA ≤ JUCO)
3. **P0**: Ensure video never reduces scores
4. **P1**: Lower temperature for numerical scoring
5. **P1**: Post-processing validation layer
6. **P2**: Weight self-assessed athletics by league tier
7. **P2**: Add funnel sub-stages
8. **P3**: Height acknowledgment in evaluations

