import { PlayerProfile, AnalysisResult, VerifiedReadiness, GapFactors, YouthLeague } from "../types";

const LEVELS = ["D1", "D2", "D3", "NAIA", "JUCO"] as const;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

// League tier for verified readiness calculation
// MLS_NEXT and ECNL/GA are both tier 4 for verified readiness (self-assessment credibility)
// The base score differentiation happens in the API prompt, not here
const LEAGUE_TIER: Record<YouthLeague, number> = {
  MLS_NEXT: 4, ECNL: 4, Girls_Academy: 4,
  ECNL_RL: 3, USYS_National_League: 3,
  Elite_Local: 2,
  High_School: 1, Other: 1,
};

// Deterministic market readiness computation (replaces LLM guess)
function computeMarketReadiness(profile: PlayerProfile): number {
  const videoScore = profile.videoType === 'Edited_Highlight_Reel' ? 90
    : profile.videoType === 'Raw_Game_Footage' ? 55 : 15;

  const contacts = profile.coachesContacted || 0;
  const responses = profile.responsesReceived || 0;
  const offers = profile.offersReceived || 0;

  // Volume: 50 contacts = 100 (full marks)
  const contactScore = Math.min(contacts / 50, 1) * 100;

  // Response quality: 25% response rate = 100 (full marks)
  const responseRate = contacts > 0 ? responses / contacts : 0;
  const responseScore = Math.min(responseRate * 4, 1) * 100;

  // Offers: 3 offers = 100 (full marks)
  const offerScore = Math.min(offers / 3, 1) * 100;

  return Math.round(
    videoScore * 0.30 +
    contactScore * 0.25 +
    responseScore * 0.25 +
    offerScore * 0.20
  );
}

const TIER_MULTIPLIER: Record<number, number> = {
  4: 1.0,   // Elite: face value
  3: 0.75,  // High: unverified at top level
  2: 0.6,   // Mid
  1: 0.5,   // Low
};

const TIER_LABEL: Record<number, string> = {
  4: '',
  3: 'competitive but one tier below national showcase leagues',
  2: 'a regional league — limited national exposure',
  1: 'a local league — unverified at any competitive level',
};

const VIDEO_MULTIPLIER: Record<string, number> = {
  Edited_Highlight_Reel: 1.0,
  Raw_Game_Footage: 0.85,
  None: 0.6,
};

function computeVerifiedReadiness(profile: PlayerProfile, readiness: { athletic: number; technical: number; tactical: number }): { verified: VerifiedReadiness; gapFactors: GapFactors } {
  // Get highest league tier from latest season
  const latestSeason = profile.seasons.length > 0
    ? profile.seasons.reduce((a, b) => b.year >= a.year ? b : a)
    : null;

  let highestTier = 1;
  if (latestSeason) {
    for (const league of latestSeason.league) {
      highestTier = Math.max(highestTier, LEAGUE_TIER[league] || 1);
    }
  }

  const leagueMult = TIER_MULTIPLIER[highestTier] ?? 0.5;
  const videoMult = VIDEO_MULTIPLIER[profile.videoType] ?? 0.6;

  const verified: VerifiedReadiness = {
    athletic: Math.round(readiness.athletic * leagueMult * videoMult),
    technical: Math.round(readiness.technical * leagueMult * videoMult),
    tactical: Math.round(readiness.tactical * leagueMult * videoMult),
  };

  const gapFactors: GapFactors = {
    video: profile.videoType !== 'Edited_Highlight_Reel',
    league: highestTier < 4,
    outreach: profile.coachesContacted < 30,
    videoLabel: profile.videoType === 'None'
      ? 'No highlight video — coaches cannot evaluate your abilities'
      : profile.videoType === 'Raw_Game_Footage'
        ? 'Raw footage only — an edited highlight reel increases coach engagement'
        : '',
    leagueLabel: TIER_LABEL[highestTier] || '',
  };

  return { verified, gapFactors };
}

function validateAndNormalize(raw: any): AnalysisResult {
  // Ensure visibilityScores is an array with all 5 levels
  let vis = Array.isArray(raw.visibilityScores) ? raw.visibilityScores : [];

  // Normalize level names and clamp percentages
  vis = vis.map((v: any) => ({
    ...v,
    level: (v.level || "").replace(/NCAA\s*/i, "").trim(),
    visibilityPercent: clamp(v.visibilityPercent || 0, 0, 100),
  }));

  // Ensure all 5 levels exist
  for (const level of LEVELS) {
    if (!vis.find((v: any) => v.level === level)) {
      vis.push({ level, visibilityPercent: 0, notes: "Not evaluated" });
    }
  }

  // Ensure readinessScore is an object with 5 numeric keys
  let rs = raw.readinessScore;
  if (typeof rs === "number") {
    rs = { athletic: rs, technical: rs, tactical: rs, academic: rs, market: rs };
  }
  rs = rs || {};
  for (const key of ["athletic", "technical", "tactical", "academic", "market"] as const) {
    rs[key] = clamp(rs[key] || 50, 0, 100);
  }

  return {
    ...raw,
    visibilityScores: vis,
    readinessScore: rs,
    keyStrengths: Array.isArray(raw.keyStrengths) ? raw.keyStrengths : [],
    keyRisks: Array.isArray(raw.keyRisks) ? raw.keyRisks : [],
    actionPlan: Array.isArray(raw.actionPlan) ? raw.actionPlan : [],
    benchmarkAnalysis: Array.isArray(raw.benchmarkAnalysis) ? raw.benchmarkAnalysis : [],
    funnelAnalysis: raw.funnelAnalysis || {
      stage: "Invisible",
      conversionRate: "0%",
      bottleneck: "Unknown",
      advice: "Review data",
    },
    plainLanguageSummary: raw.plainLanguageSummary || "",
    coachShortEvaluation: raw.coachShortEvaluation || "",
  };
}

export const analyzeExposure = async (profile: PlayerProfile): Promise<AnalysisResult> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("You've reached the analysis limit. Please try again in an hour.");
    }
    throw new Error(errorData.error || `Analysis failed (${response.status})`);
  }

  const raw = await response.json();
  const result = validateAndNormalize(raw);

  // Sanity check: must have 5 visibility scores
  if (result.visibilityScores.length < 5) {
    throw new Error("Incomplete visibility scores");
  }

  // Override market readiness with deterministic computation (not LLM-guessed)
  result.readinessScore.market = computeMarketReadiness(profile);

  // Compute verified readiness scores (deterministic, not LLM-dependent)
  const { verified, gapFactors } = computeVerifiedReadiness(profile, result.readinessScore);
  result.verifiedReadiness = verified;
  result.gapFactors = gapFactors;

  return result;
};
