
import { YouthLeague, Position, CollegeLevel } from './types';

export const LEAGUES: YouthLeague[] = [
  "MLS_NEXT",
  "ECNL",
  "Girls_Academy",
  "ECNL_RL",
  "USYS_National_League",
  "High_School",
  "Elite_Local",
  "Other"
];

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
// Removed from client bundle — it was 4KB+ of dead weight shipped to every user.
