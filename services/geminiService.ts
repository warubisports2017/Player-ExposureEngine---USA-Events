
import { GoogleGenAI, Type } from "@google/genai";
import { PlayerProfile, AnalysisResult } from "../types";
import { SYSTEM_PROMPT } from "../constants";

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

  // Define the schema for the output to ensure type safety
  // Removed strict ENUMs from schema to prevent validation failures; the prompt handles constraints.
  const schema = {
    type: Type.OBJECT,
    properties: {
      visibilityScores: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING },
            visibilityPercent: { type: Type.NUMBER },
            notes: { type: Type.STRING }
          }
        }
      },
      readinessScore: {
        type: Type.OBJECT,
        properties: {
          athletic: { type: Type.NUMBER },
          technical: { type: Type.NUMBER },
          tactical: { type: Type.NUMBER },
          academic: { type: Type.NUMBER },
          market: { type: Type.NUMBER }
        }
      },
      keyStrengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      keyRisks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            message: { type: Type.STRING },
            severity: { type: Type.STRING }
          }
        }
      },
      actionPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timeframe: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING }
          }
        }
      },
      plainLanguageSummary: { type: Type.STRING },
      coachShortEvaluation: { type: Type.STRING },
      funnelAnalysis: {
        type: Type.OBJECT,
        properties: {
          stage: { type: Type.STRING },
          conversionRate: { type: Type.STRING },
          bottleneck: { type: Type.STRING },
          advice: { type: Type.STRING }
        }
      },
      benchmarkAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            userScore: { type: Type.NUMBER },
            d1Average: { type: Type.NUMBER },
            d3Average: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          }
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: userPrompt }]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Failed", error);
    throw error;
  }
};
