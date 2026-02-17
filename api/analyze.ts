import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';

// --- Rate Limiting (in-memory per instance) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

// Cleanup stale entries periodically (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 10 * 60 * 1000); // every 10 min

// --- Input Validation ---
function validateProfile(profile: any): string | null {
  if (!profile || typeof profile !== 'object') return 'Invalid profile data';
  if (!profile.firstName || typeof profile.firstName !== 'string' || profile.firstName.length > 100)
    return 'Invalid first name';
  if (!profile.lastName || typeof profile.lastName !== 'string' || profile.lastName.length > 100)
    return 'Invalid last name';
  if (!['Male', 'Female'].includes(profile.gender)) return 'Invalid gender';
  if (!profile.position || typeof profile.position !== 'string') return 'Invalid position';
  if (typeof profile.gradYear !== 'number' || profile.gradYear < 2020 || profile.gradYear > 2035)
    return 'Invalid graduation year';

  // Check string field lengths to prevent token abuse
  const jsonSize = JSON.stringify(profile).length;
  if (jsonSize > 10000) return 'Profile data too large';

  return null;
}

// --- Gemini Schema ---
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: [
    'visibilityScores', 'readinessScore', 'keyStrengths', 'keyRisks',
    'actionPlan', 'plainLanguageSummary', 'coachShortEvaluation',
    'funnelAnalysis', 'benchmarkAnalysis',
  ],
  properties: {
    visibilityScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['level', 'visibilityPercent', 'notes'],
        properties: {
          level: { type: Type.STRING, enum: ['D1', 'D2', 'D3', 'NAIA', 'JUCO'] },
          visibilityPercent: { type: Type.NUMBER },
          notes: { type: Type.STRING },
        },
      },
    },
    readinessScore: {
      type: Type.OBJECT,
      required: ['athletic', 'technical', 'tactical', 'academic', 'market'],
      properties: {
        athletic: { type: Type.NUMBER },
        technical: { type: Type.NUMBER },
        tactical: { type: Type.NUMBER },
        academic: { type: Type.NUMBER },
        market: { type: Type.NUMBER },
      },
    },
    keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    keyRisks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['category', 'message', 'severity'],
        properties: {
          category: {
            type: Type.STRING,
            enum: ['League', 'Minutes', 'Academics', 'Events', 'Location', 'Media', 'Communication', 'Verification'],
          },
          message: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        },
      },
    },
    actionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['timeframe', 'description', 'impact'],
        properties: {
          timeframe: { type: Type.STRING, enum: ['Next_30_Days', 'Next_90_Days', 'Next_12_Months'] },
          description: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        },
      },
    },
    plainLanguageSummary: { type: Type.STRING },
    coachShortEvaluation: { type: Type.STRING },
    funnelAnalysis: {
      type: Type.OBJECT,
      required: ['stage', 'conversionRate', 'bottleneck', 'advice'],
      properties: {
        stage: { type: Type.STRING, enum: ['Invisible', 'Outreach', 'Conversation', 'Evaluation', 'Closing'] },
        conversionRate: { type: Type.STRING },
        bottleneck: { type: Type.STRING },
        advice: { type: Type.STRING },
      },
    },
    benchmarkAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['category', 'userScore', 'feedback'],
        properties: {
          category: { type: Type.STRING, enum: ['Physical', 'Soccer Resume', 'Academics'] },
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

// --- Handler ---
const MAX_RETRIES = 1;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit by IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: '1 hour',
    });
  }

  // Validate input
  const profile = req.body;
  const validationError = validateProfile(profile);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Call Gemini
  const ai = new GoogleGenAI({ apiKey });
  const userPrompt = `
    ${SYSTEM_PROMPT}

    **Player Profile Data:**
    ${JSON.stringify(profile, null, 2)}
  `;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: userPrompt }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) throw new Error('No response from AI');

      const result = JSON.parse(text);
      return res.status(200).json(result);
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error('Gemini API error:', error);
        return res.status(502).json({ error: 'Analysis failed. Please try again.' });
      }
      console.warn(`Attempt ${attempt + 1} failed, retrying...`);
    }
  }
}
