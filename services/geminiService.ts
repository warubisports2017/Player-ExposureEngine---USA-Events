


import { GoogleGenAI, Type } from "@google/genai";
import { PlayerProfile, AnalysisResult } from "../types";
import { SYSTEM_PROMPT } from "../constants";

const LEVELS = ["D1", "D2", "D3", "NAIA", "JUCO"] as const;
const MAX_RETRIES = 1;

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
  let apiKey: string | undefined;

  try {
    apiKey = process.env.API_KEY;
  } catch (e) {
    // In some browser environments, accessing process might throw ReferenceError
    console.error("Error accessing process.env", e);
  }

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const userPrompt = `
    ${SYSTEM_PROMPT}

    **Player Profile Data:**
    ${JSON.stringify(profile, null, 2)}
  `;

  const schema = {
    type: Type.OBJECT,
    required: [
      "visibilityScores", "readinessScore", "keyStrengths", "keyRisks",
      "actionPlan", "plainLanguageSummary", "coachShortEvaluation",
      "funnelAnalysis", "benchmarkAnalysis",
    ],
    properties: {
      visibilityScores: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["level", "visibilityPercent", "notes"],
          properties: {
            level: { type: Type.STRING, enum: ["D1", "D2", "D3", "NAIA", "JUCO"] },
            visibilityPercent: { type: Type.NUMBER },
            notes: { type: Type.STRING },
          },
        },
      },
      readinessScore: {
        type: Type.OBJECT,
        required: ["athletic", "technical", "tactical", "academic", "market"],
        properties: {
          athletic: { type: Type.NUMBER },
          technical: { type: Type.NUMBER },
          tactical: { type: Type.NUMBER },
          academic: { type: Type.NUMBER },
          market: { type: Type.NUMBER },
        },
      },
      keyStrengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      keyRisks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["category", "message", "severity"],
          properties: {
            category: {
              type: Type.STRING,
              enum: ["League", "Minutes", "Academics", "Events", "Location", "Media", "Communication", "Verification"],
            },
            message: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          },
        },
      },
      actionPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["timeframe", "description", "impact"],
          properties: {
            timeframe: { type: Type.STRING, enum: ["Next_30_Days", "Next_90_Days", "Next_12_Months"] },
            description: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          },
        },
      },
      plainLanguageSummary: { type: Type.STRING },
      coachShortEvaluation: { type: Type.STRING },
      funnelAnalysis: {
        type: Type.OBJECT,
        required: ["stage", "conversionRate", "bottleneck", "advice"],
        properties: {
          stage: { type: Type.STRING, enum: ["Invisible", "Outreach", "Conversation", "Evaluation", "Closing"] },
          conversionRate: { type: Type.STRING },
          bottleneck: { type: Type.STRING },
          advice: { type: Type.STRING },
        },
      },
      benchmarkAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["category", "userScore", "feedback"],
          properties: {
            category: { type: Type.STRING, enum: ["Physical", "Soccer Resume", "Academics"] },
            userScore: { type: Type.NUMBER },
            d1Score: { type: Type.NUMBER },
            d2Score: { type: Type.NUMBER },
            d3Score: { type: Type.NUMBER },
            naiaScore: { type: Type.NUMBER },
            jucoScore: { type: Type.NUMBER },
            marketAccess: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
          },
        },
      },
    },
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [{ text: userPrompt }],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const raw = JSON.parse(text);
      const result = validateAndNormalize(raw);

      // Sanity check: must have 5 visibility scores
      if (result.visibilityScores.length < 5) {
        throw new Error("Incomplete visibility scores");
      }

      return result;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error("Analysis Failed", error);
        throw error;
      }
      console.warn(`Attempt ${attempt + 1} failed, retrying...`, error);
    }
  }

  // TypeScript: unreachable but satisfies return type
  throw new Error("Analysis failed after all retries");
};
