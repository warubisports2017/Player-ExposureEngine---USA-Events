
import { NamedLeague, GenericLevel, CompetitiveLevel, Position, CollegeLevel } from './types';

// Named North American Youth Leagues (routing: "Yes, I play in a named NA youth league")
export const NAMED_LEAGUES: { value: NamedLeague; label: string }[] = [
  { value: "MLS_NEXT", label: "MLS NEXT" },
  { value: "ECNL_GA", label: "ECNL / Girls Academy" },
  { value: "ECNL_RL_USYS_USL", label: "ECNL RL / USYS National League / USL Academy" },
  { value: "NPL_Regional", label: "NPL / Regional Premier" },
  { value: "High_School", label: "High School" },
  { value: "Local_Recreational", label: "Local / Recreational" },
];

// Generic Competition Levels (routing: "No" - international, US adult, anything else)
export const GENERIC_LEVELS: { value: GenericLevel; label: string; hint: string }[] = [
  { value: "Professional", label: "Professional league", hint: "Players are full-time athletes" },
  { value: "Semi_Professional", label: "Semi-professional league", hint: "Some players are paid to play" },
  { value: "Amateur", label: "Amateur league", hint: "Organized competition, unpaid" },
  { value: "Recreational", label: "Recreational / casual", hint: "" },
];

// Display label for any CompetitiveLevel value
export const COMPETITIVE_LEVEL_LABELS: Record<CompetitiveLevel, string> = {
  MLS_NEXT: "MLS NEXT",
  ECNL_GA: "ECNL / Girls Academy",
  ECNL_RL_USYS_USL: "ECNL RL / USYS NL / USL Academy",
  NPL_Regional: "NPL / Regional Premier",
  High_School: "High School",
  Local_Recreational: "Local / Recreational",
  Professional: "Professional League",
  Semi_Professional: "Semi-Professional League",
  Amateur: "Amateur League",
  Recreational: "Recreational / Casual",
};

export const POSITIONS: Position[] = [
  "GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"
];

export const LEVELS: CollegeLevel[] = [
  "D1", "D2", "D3", "NAIA", "JUCO"
];

export const ATHLETIC_RATINGS = [
  "Below_Average",
  "Average",
  "Above_Average",
  "Top_10_Percent",
  "Elite"
];

// SYSTEM_PROMPT lives only in api/analyze.ts (server-side).
// Removed from client bundle -- it was 4KB+ of dead weight shipped to every user.
