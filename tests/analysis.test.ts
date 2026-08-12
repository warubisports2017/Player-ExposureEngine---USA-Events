import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { analyzeExposure } from '../services/geminiService.ts';
import { humanizeProfileForPrompt, validateProfile } from '../api/analyze.ts';
import type { AnalysisResult, PlayerProfile } from '../types.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function profile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    firstName: 'Test',
    lastName: 'Player',
    gender: 'Male',
    dateOfBirth: '2008-01-01',
    citizenship: ['USA'],
    experienceLevel: [],
    position: 'CM',
    secondaryPositions: [],
    dominantFoot: 'Right',
    height: `5'10"`,
    gradYear: 2027,
    state: 'California - South',
    seasons: [{
      year: 2026,
      teamName: 'Test FC',
      competitiveLevel: 'ECNL_GA',
      namedLeagueRoute: true,
      minutesPlayedPercent: 80,
      mainRole: 'Key_Starter',
      gamesPlayed: 20,
      goals: 3,
      assists: 4,
      honors: '',
    }],
    academics: { graduationYear: 2027, gpa: 3.5 },
    athleticProfile: {
      speed: 'Above_Average',
      strength: 'Above_Average',
      endurance: 'Above_Average',
      workRate: 'Above_Average',
      technical: 'Above_Average',
      tactical: 'Above_Average',
    },
    events: [],
    videoType: 'Edited_Highlight_Reel',
    coachesContacted: 50,
    responsesReceived: 10,
    offersReceived: 1,
    ...overrides,
  };
}

function analysis(scores = [10, 20, 30, 40, 50]): AnalysisResult {
  const levels = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'] as const;
  return {
    visibilityScores: levels.map((level, index) => ({
      level,
      visibilityPercent: scores[index],
      notes: `${level} test note`,
    })),
    readinessScore: {
      athletic: 90,
      technical: 80,
      tactical: 70,
      academic: 80,
      market: 0,
    },
    keyStrengths: ['Test strength'],
    keyRisks: [],
    actionPlan: [],
    plainLanguageSummary: 'Test summary',
    coachShortEvaluation: 'Test evaluation',
    funnelAnalysis: {
      stage: 'Outreach',
      conversionRate: '20%',
      bottleneck: 'Test',
      advice: 'Test',
    },
    benchmarkAnalysis: [],
  };
}

function mockAnalysisResponse(result: AnalysisResult): void {
  globalThis.fetch = async () => new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('enforces the documented D1 <= D2 <= D3 <= NAIA <= JUCO cascade', async () => {
  mockAnalysisResponse(analysis([80, 79, 78, 77, 76]));
  const result = await analyzeExposure(profile());
  const scores = Object.fromEntries(result.visibilityScores.map(({ level, visibilityPercent }) => [level, visibilityPercent]));

  assert.ok(scores.D1 <= scores.D2);
  assert.ok(scores.D2 <= scores.D3);
  assert.ok(scores.D3 <= scores.NAIA);
  assert.ok(scores.NAIA <= scores.JUCO);
});

test('treats tier-5 MLS NEXT evidence as at least as credible as tier-4 ECNL evidence', async () => {
  mockAnalysisResponse(analysis());
  const mls = await analyzeExposure(profile({
    seasons: [{ ...profile().seasons[0], competitiveLevel: 'MLS_NEXT' }],
  }));
  mockAnalysisResponse(analysis());
  const ecnl = await analyzeExposure(profile());

  assert.ok(mls.verifiedReadiness);
  assert.ok(ecnl.verifiedReadiness);
  assert.ok(mls.verifiedReadiness.athletic >= ecnl.verifiedReadiness.athletic);
  assert.ok(mls.verifiedReadiness.technical >= ecnl.verifiedReadiness.technical);
  assert.ok(mls.verifiedReadiness.tactical >= ecnl.verifiedReadiness.tactical);
});

test('uses the documented professional base visibility floors', async () => {
  mockAnalysisResponse(analysis([0, 0, 0, 0, 0]));
  const result = await analyzeExposure(profile({
    seasons: [{ ...profile().seasons[0], competitiveLevel: 'Professional', namedLeagueRoute: false }],
  }));
  const scores = Object.fromEntries(result.visibilityScores.map(({ level, visibilityPercent }) => [level, visibilityPercent]));

  assert.deepEqual(scores, { D1: 80, D2: 90, D3: 92, NAIA: 95, JUCO: 98 });
});

test('keeps deterministic market readiness within the public 0-100 contract', async () => {
  mockAnalysisResponse(analysis());
  const result = await analyzeExposure(profile({
    videoType: 'None',
    coachesContacted: -100,
    responsesReceived: 0,
    offersReceived: -10,
  }));

  assert.ok(result.readinessScore.market >= 0);
  assert.ok(result.readinessScore.market <= 100);
});

test('normalizes missing and out-of-range model scores before display', async () => {
  const raw = analysis([140, -20, 30, 40, 50]);
  raw.visibilityScores = raw.visibilityScores.slice(0, 2);
  mockAnalysisResponse(raw);
  const result = await analyzeExposure(profile());
  const scores = Object.fromEntries(result.visibilityScores.map(({ level, visibilityPercent }) => [level, visibilityPercent]));

  assert.deepEqual(Object.keys(scores).sort(), ['D1', 'D2', 'D3', 'JUCO', 'NAIA']);
  assert.equal(scores.D1, 100);
  assert.ok(Object.values(scores).every((score) => score >= 0 && score <= 100));
});

test('preserves legitimate zero readiness scores instead of replacing them with 50', async () => {
  const raw = analysis();
  raw.readinessScore = { athletic: 0, technical: 0, tactical: 0, academic: 0, market: 0 };
  mockAnalysisResponse(raw);
  const result = await analyzeExposure(profile());

  assert.equal(result.readinessScore.athletic, 0);
  assert.equal(result.readinessScore.technical, 0);
  assert.equal(result.readinessScore.tactical, 0);
  assert.equal(result.readinessScore.academic, 0);
});

test('returns exactly one ordered score for each college level', async () => {
  const raw = analysis();
  raw.visibilityScores = [
    { level: 'D1', visibilityPercent: 10, notes: 'first' },
    { level: 'D1', visibilityPercent: 99, notes: 'duplicate' },
    { level: 'NCAA D2' as any, visibilityPercent: 20, notes: 'normalized' },
    { level: 'UNKNOWN' as 'D3', visibilityPercent: 50, notes: 'invalid' },
  ];
  mockAnalysisResponse(raw);
  const result = await analyzeExposure(profile());

  assert.deepEqual(result.visibilityScores.map(({ level }) => level), ['D1', 'D2', 'D3', 'NAIA', 'JUCO']);
  assert.equal(result.visibilityScores.length, 5);
  assert.equal(result.visibilityScores[0].visibilityPercent, 42);
});

test('keeps raw scoring tokens in the AI prompt and adds separate display labels', () => {
  const input = profile({
    experienceLevel: ['Semi_Pro_UPSL_NPSL_WPSL'],
    seasons: [{ ...profile().seasons[0], competitiveLevel: 'MLS_NEXT' }],
  });
  const promptProfile = humanizeProfileForPrompt(input);

  assert.deepEqual(promptProfile.experienceLevel, ['Semi_Pro_UPSL_NPSL_WPSL']);
  assert.deepEqual(promptProfile.experienceLevelLabels, ['Semi-Pro (UPSL / NPSL / WPSL)']);
  assert.equal(promptProfile.seasons[0].competitiveLevel, 'MLS_NEXT');
  assert.equal(promptProfile.seasons[0].competitiveLevelLabel, 'MLS NEXT');
});

test('surfaces API rate limits without accepting a partial result', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'rate limited' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  });

  await assert.rejects(() => analyzeExposure(profile()), /analysis limit.*hour/i);
});

test('server validation rejects impossible funnel counts and negative statistics', () => {
  assert.match(validateProfile(profile({ coachesContacted: -1 })) || '', /funnel counts/i);
  assert.match(validateProfile(profile({ coachesContacted: '10' as any })) || '', /funnel counts/i);
  assert.match(validateProfile(profile({ coachesContacted: null as any })) || '', /funnel counts/i);
  assert.match(validateProfile(profile({ coachesContacted: 1, responsesReceived: 2 })) || '', /replies/i);
  assert.match(validateProfile(profile({ coachesContacted: 2, responsesReceived: 1, offersReceived: 2 })) || '', /offers/i);
  assert.match(validateProfile(profile({
    seasons: [{ ...profile().seasons[0], gamesPlayed: -1 }],
  })) || '', /season statistics/i);
  assert.match(validateProfile(profile({
    seasons: [{ ...profile().seasons[0], gamesPlayed: null as any }],
  })) || '', /season statistics/i);
  assert.match(validateProfile(profile({
    seasons: [{ ...profile().seasons[0], minutesPlayedPercent: '80' as any }],
  })) || '', /minutes/i);
});

test('server validation rejects invalid GPA, future birth dates, and unknown tiers', () => {
  assert.match(validateProfile(profile({ academics: { graduationYear: 2027, gpa: 4.5 } })) || '', /GPA/i);
  assert.match(validateProfile(profile({ academics: { graduationYear: 2027, gpa: '3.5' as any } })) || '', /GPA/i);
  assert.match(validateProfile(profile({ academics: { graduationYear: 2027, gpa: null as any } })) || '', /GPA/i);
  assert.match(validateProfile(profile({ dateOfBirth: '2099-01-01' })) || '', /birth/i);
  assert.match(validateProfile(profile({ dateOfBirth: '2026-02-31' })) || '', /birth/i);
  assert.match(validateProfile(profile({
    seasons: [{ ...profile().seasons[0], competitiveLevel: 'Unknown' as any }],
  })) || '', /competitive level/i);
  assert.match(validateProfile(profile({
    seasons: [{ ...profile().seasons[0], competitiveLevel: undefined as any, league: ['Unknown' as any] }],
  })) || '', /competitive level/i);
});

test('server validation accepts known legacy league profiles', () => {
  assert.equal(validateProfile(profile({
    seasons: [{ ...profile().seasons[0], competitiveLevel: undefined as any, league: ['High_School'] }],
  })), null);
});
