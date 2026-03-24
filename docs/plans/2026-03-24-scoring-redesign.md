# Exposure Engine Scoring Redesign

## Problem
60% of EE leads select "Other" for league, forcing Gemini to guess the tier from free text. The form only has US youth leagues. International players, US adult players, and anyone outside the 8 named leagues get underscored.

## Solution
Replace league multi-select with a routing question + single-select competitive level.

## Form Design

### Routing: "Do you play in a named North American youth league?"

**If Yes:**
- MLS NEXT
- ECNL / Girls Academy
- ECNL RL / USYS National League / USL Academy
- NPL / Regional Premier
- High School
- Local / Recreational

**If No:**
- Professional league (players are full-time athletes)
- Semi-professional league (some players are paid to play)
- Amateur league (organized competition, unpaid)
- Recreational / casual

**Plus:** Optional "Team / League Name" text field

### Scoring (Boys, cascading: D1 <= D2 <= D3 <= NAIA <= JUCO)

Named:
| Selection | D1 | D2 | D3 | NAIA | JUCO |
|---|---|---|---|---|---|
| MLS NEXT | 55 | 80 | 82 | 85 | 90 |
| ECNL / GA | 42 | 72 | 75 | 80 | 88 |
| ECNL RL / USYS / USL | 15 | 60 | 65 | 70 | 80 |
| NPL / Regional | 8 | 35 | 55 | 60 | 70 |
| High School / Local | 5 | 20 | 40 | 45 | 60 |

Generic:
| Selection | D1 | D2 | D3 | NAIA | JUCO |
|---|---|---|---|---|---|
| Professional | 80 | 90 | 92 | 95 | 98 |
| Semi-professional | 42 | 72 | 75 | 80 | 88 |
| Amateur | 15 | 60 | 65 | 70 | 80 |
| Recreational | 5 | 20 | 40 | 45 | 60 |

Girls: Same cascading, higher bases (more programs).

### Bonus Fixes
1. Graduated height: GK 6'3"+3, 6'5"+8, 6'7"+ +15. CB proportional.
2. Eligibility flags when experience = Pro_Academy or Semi_Pro.

## Files
1. `types.ts` - CompetitiveLevel type, SeasonStat field change
2. `constants.ts` - New grouped options
3. `PlayerInputForm.tsx` - Routing + single-select + text field
4. `api/analyze.ts` - Step A simplification, cascading scores, height, eligibility

## Backward Compat
Old: `league: ["ECNL", "Other"]` (array). New: `competitiveLevel: "ECNL_GA"` (string).
