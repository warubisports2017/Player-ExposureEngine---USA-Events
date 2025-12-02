

export type YouthLeague =
  | "MLS_NEXT"
  | "ECNL"
  | "Girls_Academy"
  | "USYS_National_League"
  | "ECNL_RL"
  | "High_School"
  | "Elite_Local"
  | "Other";

export type CollegeLevel = "D1" | "D2" | "D3" | "NAIA" | "JUCO";

export type Position =
  | "GK" | "CB" | "FB" | "WB" | "DM" | "CM" | "AM" | "WING" | "9" | "Utility";

export type ExperienceLevel = 
  | "Youth_Club_Only"
  | "High_School_Varsity"
  | "Adult_Amateur_League"
  | "Semi_Pro_UPSL_NPSL_WPSL"
  | "International_Academy_U19"
  | "Pro_Academy_Reserve";

export interface SeasonStat {
  year: number;
  teamName: string;
  league: YouthLeague[]; // Changed to array
  minutesPlayedPercent: number; // Simplified from raw minutes for better UX
  mainRole: "Key_Starter" | "Rotation" | "Bench" | "Injured";
  goals: number;
  assists: number;
  honors: string; // Comma separated
}

export interface AcademicProfile {
  graduationYear: number;
  gpa: number;
  testScore?: string; // e.g. "1250 SAT"
}

export interface ExposureEvent {
  name: string;
  type: "Showcase" | "ID_Camp" | "ODP" | "HS_Playoffs" | "Other";
  collegesNoted: string; // Comma separated list of colleges seen
}

export interface AthleticProfile {
  speed: string;
  strength: string;
  endurance: string;
  workRate: string;
  technical: string;
  tactical: string;
}

export interface PlayerProfile {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  dateOfBirth: string; // YYYY-MM-DD for maturity calc
  citizenship: string;
  experienceLevel: ExperienceLevel; // New field for maturity/adult play
  position: Position;
  secondaryPositions: Position[];
  dominantFoot: "Right" | "Left" | "Both";
  height: string; // Format: "5'10""
  gradYear: number;
  state: string;
  seasons: SeasonStat[];
  academics: AcademicProfile;
  athleticProfile: AthleticProfile;
  events: ExposureEvent[];
  videoLink: boolean;
  coachesContacted: number;
  responsesReceived: number;
  offersReceived: number;
}

// AI Analysis Result Types

export interface VisibilityScore {
  level: CollegeLevel;
  visibilityPercent: number; // 0-100
  notes: string;
}

export interface ReadinessScore {
  athletic: number;
  technical: number;
  tactical: number;
  academic: number;
  market: number; // visibility + fit
}

export interface RiskFlag {
  category: "League" | "Minutes" | "Academics" | "Events" | "Location" | "Media" | "Communication";
  message: string;
  severity: "Low" | "Medium" | "High";
}

export interface ActionItem {
  timeframe: "Next_30_Days" | "Next_90_Days" | "Next_12_Months";
  description: string;
  impact: "High" | "Medium" | "Low";
}

export interface FunnelAnalysis {
  stage: "Invisible" | "Outreach" | "Conversation" | "Evaluation" | "Closing";
  conversionRate: string; // e.g., "5% Reply Rate"
  bottleneck: string; // e.g., "Your emails are being ignored"
  advice: string; // e.g., "Fix subject line"
}

export interface BenchmarkMetric {
  category: string; // e.g. "Physical", "Soccer Resume", "Academics"
  userScore: number; // 0-100 scale
  d1Average: number;
  d3Average: number;
  feedback: string; // Short explanation
}

export interface AnalysisResult {
  visibilityScores: VisibilityScore[];
  readinessScore: ReadinessScore;
  keyStrengths: string[];
  keyRisks: RiskFlag[];
  actionPlan: ActionItem[];
  plainLanguageSummary: string;
  coachShortEvaluation: string; // Brief, database-style summary
  funnelAnalysis: FunnelAnalysis; // New field for Pain Point #3
  benchmarkAnalysis: BenchmarkMetric[]; // New field for Phase 2 (Reality Check)
}
