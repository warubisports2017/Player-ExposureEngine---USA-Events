import { PlayerProfile, AnalysisResult } from "../types";

const LEVELS = ["D1", "D2", "D3", "NAIA", "JUCO"] as const;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
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

  return result;
};
