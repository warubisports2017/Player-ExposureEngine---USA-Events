/**
 * Algorithm Test Script — COPA Talent ID Day profiles
 * Tests the fixed geminiService schema + validation against 10 real profiles
 * Run: node test-algorithm.mjs
 */

import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = "AIzaSyBdUDrNSxfDhRueujHkYu0F_oa0npc0MQc";
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Import SYSTEM_PROMPT inline (can't import .ts from .mjs)
// We'll read it from constants.ts dynamically
import { readFileSync } from "fs";
const constantsFile = readFileSync("./constants.ts", "utf-8");
const systemPromptMatch = constantsFile.match(/export const SYSTEM_PROMPT = `([\s\S]*?)`;/);
const SYSTEM_PROMPT = systemPromptMatch[1];

const LEVELS = ["D1", "D2", "D3", "NAIA", "JUCO"];

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function validateAndNormalize(raw) {
  let vis = Array.isArray(raw.visibilityScores) ? raw.visibilityScores : [];
  vis = vis.map((v) => ({
    ...v,
    level: (v.level || "").replace(/NCAA\s*/i, "").trim(),
    visibilityPercent: clamp(v.visibilityPercent || 0, 0, 100),
  }));
  for (const level of LEVELS) {
    if (!vis.find((v) => v.level === level)) {
      vis.push({ level, visibilityPercent: 0, notes: "Not evaluated" });
    }
  }

  let rs = raw.readinessScore;
  if (typeof rs === "number") {
    rs = { athletic: rs, technical: rs, tactical: rs, academic: rs, market: rs };
  }
  rs = rs || {};
  for (const key of ["athletic", "technical", "tactical", "academic", "market"]) {
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
      stage: "Invisible", conversionRate: "0%", bottleneck: "Unknown", advice: "Review data",
    },
    plainLanguageSummary: raw.plainLanguageSummary || "",
    coachShortEvaluation: raw.coachShortEvaluation || "",
  };
}

const schema = {
  type: "OBJECT",
  required: [
    "visibilityScores", "readinessScore", "keyStrengths", "keyRisks",
    "actionPlan", "plainLanguageSummary", "coachShortEvaluation",
    "funnelAnalysis", "benchmarkAnalysis",
  ],
  properties: {
    visibilityScores: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["level", "visibilityPercent", "notes"],
        properties: {
          level: { type: "STRING", enum: ["D1", "D2", "D3", "NAIA", "JUCO"] },
          visibilityPercent: { type: "NUMBER" },
          notes: { type: "STRING" },
        },
      },
    },
    readinessScore: {
      type: "OBJECT",
      required: ["athletic", "technical", "tactical", "academic", "market"],
      properties: {
        athletic: { type: "NUMBER" },
        technical: { type: "NUMBER" },
        tactical: { type: "NUMBER" },
        academic: { type: "NUMBER" },
        market: { type: "NUMBER" },
      },
    },
    keyStrengths: { type: "ARRAY", items: { type: "STRING" } },
    keyRisks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["category", "message", "severity"],
        properties: {
          category: { type: "STRING", enum: ["League", "Minutes", "Academics", "Events", "Location", "Media", "Communication", "Verification"] },
          message: { type: "STRING" },
          severity: { type: "STRING", enum: ["Low", "Medium", "High"] },
        },
      },
    },
    actionPlan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["timeframe", "description", "impact"],
        properties: {
          timeframe: { type: "STRING", enum: ["Next_30_Days", "Next_90_Days", "Next_12_Months"] },
          description: { type: "STRING" },
          impact: { type: "STRING", enum: ["Low", "Medium", "High"] },
        },
      },
    },
    plainLanguageSummary: { type: "STRING" },
    coachShortEvaluation: { type: "STRING" },
    funnelAnalysis: {
      type: "OBJECT",
      required: ["stage", "conversionRate", "bottleneck", "advice"],
      properties: {
        stage: { type: "STRING", enum: ["Invisible", "Outreach", "Conversation", "Evaluation", "Closing"] },
        conversionRate: { type: "STRING" },
        bottleneck: { type: "STRING" },
        advice: { type: "STRING" },
      },
    },
    benchmarkAnalysis: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["category", "userScore", "feedback"],
        properties: {
          category: { type: "STRING", enum: ["Physical", "Soccer Resume", "Academics"] },
          userScore: { type: "NUMBER" },
          d1Score: { type: "NUMBER" },
          d2Score: { type: "NUMBER" },
          d3Score: { type: "NUMBER" },
          naiaScore: { type: "NUMBER" },
          jucoScore: { type: "NUMBER" },
          marketAccess: { type: "NUMBER" },
          feedback: { type: "STRING" },
        },
      },
    },
  },
};

// ─── COPA Player Profiles ───────────────────────────────────────

function makeProfile(overrides) {
  const base = {
    firstName: "",
    lastName: "",
    email: "",
    gender: "Male",
    dateOfBirth: "2014-01-15",
    citizenship: ["US"],
    experienceLevel: "Youth_Club_Only",
    position: "LW",
    secondaryPositions: [],
    dominantFoot: "Right",
    height: "5'6\"",
    gradYear: 2030,
    state: "CA",
    seasons: [],
    academics: { graduationYear: 2030, gpa: 3.5 },
    athleticProfile: {
      speed: "Above_Average",
      strength: "Above_Average",
      endurance: "Above_Average",
      workRate: "Above_Average",
      technical: "Above_Average",
      tactical: "Above_Average",
    },
    events: [],
    videoType: "None",
    coachesContacted: 0,
    responsesReceived: 0,
    offersReceived: 0,
  };
  return { ...base, ...overrides };
}

const COPA_PROFILES = [
  makeProfile({
    firstName: "Benjamin", lastName: "Hayes", gender: "Male", dateOfBirth: "2013-08-15",
    position: "LW", secondaryPositions: ["ST"], height: "5'4\"", gradYear: 2032, state: "CA",
    seasons: [{ year: 2025, teamName: "Atletico Santa Rosa MLS NEXT", league: ["MLS_NEXT"], minutesPlayedPercent: 75, mainRole: "Key_Starter", gamesPlayed: 18, goals: 6, assists: 4, honors: "" }],
    academics: { graduationYear: 2032, gpa: 3.5 },
    athleticProfile: { speed: "Above_Average", strength: "Above_Average", endurance: "Above_Average", workRate: "Above_Average", technical: "Above_Average", tactical: "Above_Average" },
  }),
  makeProfile({
    firstName: "Brayden", lastName: "Shen", gender: "Male", dateOfBirth: "2010-11-01",
    position: "LW", secondaryPositions: ["RB"], height: "5'5\"", gradYear: 2029, state: "CA",
    seasons: [{ year: 2025, teamName: "FC Bay Area Surf", league: ["MLS_NEXT"], minutesPlayedPercent: 80, mainRole: "Key_Starter", gamesPlayed: 22, goals: 8, assists: 5, honors: "" }],
    academics: { graduationYear: 2029, gpa: 4.0 },
    athleticProfile: { speed: "Top_10_Percent", strength: "Above_Average", endurance: "Top_10_Percent", workRate: "Above_Average", technical: "Top_10_Percent", tactical: "Above_Average" },
  }),
  makeProfile({
    firstName: "Carson", lastName: "Chen", gender: "Male", dateOfBirth: "2012-03-20",
    position: "LW", secondaryPositions: ["ST"], height: "5'6\"", gradYear: 2030, state: "CA",
    seasons: [{ year: 2025, teamName: "Mustang SC U14 ECNL", league: ["ECNL"], minutesPlayedPercent: 75, mainRole: "Key_Starter", gamesPlayed: 20, goals: 7, assists: 4, honors: "" }],
    academics: { graduationYear: 2030, gpa: 3.4 },
    athleticProfile: { speed: "Top_10_Percent", strength: "Above_Average", endurance: "Above_Average", workRate: "Above_Average", technical: "Top_10_Percent", tactical: "Above_Average" },
  }),
  makeProfile({
    firstName: "Oscar", lastName: "Saldana Vargas", gender: "Male", dateOfBirth: "2013-06-10",
    position: "ST", secondaryPositions: ["GK"], height: "4'11\"", gradYear: 2032, state: "CA",
    seasons: [{ year: 2025, teamName: "Atletico Santa Rosa FC", league: ["Other"], otherLeagueName: "Local Competitive", minutesPlayedPercent: 70, mainRole: "Key_Starter", gamesPlayed: 15, goals: 4, assists: 2, honors: "" }],
    academics: { graduationYear: 2032, gpa: 3.2 },
    athleticProfile: { speed: "Above_Average", strength: "Average", endurance: "Above_Average", workRate: "Average", technical: "Above_Average", tactical: "Average" },
  }),
  makeProfile({
    firstName: "Hader", lastName: "Minto", gender: "Male", dateOfBirth: "2012-09-01",
    position: "CM", secondaryPositions: ["LW"], height: "5'0\"", gradYear: 2031, state: "CA",
    seasons: [{ year: 2025, teamName: "Bay Area Surf U13", league: ["Other"], otherLeagueName: "Local Competitive", minutesPlayedPercent: 75, mainRole: "Key_Starter", gamesPlayed: 16, goals: 3, assists: 5, honors: "" }],
    academics: { graduationYear: 2031, gpa: 3.0 },
    athleticProfile: { speed: "Above_Average", strength: "Average", endurance: "Above_Average", workRate: "Above_Average", technical: "Above_Average", tactical: "Average" },
  }),
  makeProfile({
    firstName: "Aria", lastName: "Flores", gender: "Female", dateOfBirth: "2012-04-15",
    position: "LW", secondaryPositions: ["ST"], height: "5'2\"", gradYear: 2030, state: "CA",
    seasons: [{ year: 2025, teamName: "Cal Odyssey G12 ECNL", league: ["ECNL"], minutesPlayedPercent: 80, mainRole: "Key_Starter", gamesPlayed: 22, goals: 10, assists: 6, honors: "" }],
    academics: { graduationYear: 2030, gpa: 3.6 },
    athleticProfile: { speed: "Top_10_Percent", strength: "Above_Average", endurance: "Above_Average", workRate: "Above_Average", technical: "Top_10_Percent", tactical: "Above_Average" },
  }),
  makeProfile({
    firstName: "Emma", lastName: "Isleib", gender: "Female", dateOfBirth: "2012-02-10",
    position: "CM", secondaryPositions: [], height: "5'7\"", gradYear: 2030, state: "CA",
    seasons: [{ year: 2025, teamName: "Mustang SC ECNL-RL", league: ["ECNL_RL"], minutesPlayedPercent: 80, mainRole: "Key_Starter", gamesPlayed: 20, goals: 4, assists: 8, honors: "" }],
    academics: { graduationYear: 2030, gpa: 3.8 },
    athleticProfile: { speed: "Above_Average", strength: "Above_Average", endurance: "Above_Average", workRate: "Above_Average", technical: "Top_10_Percent", tactical: "Above_Average" },
  }),
  makeProfile({
    firstName: "Ava", lastName: "Garcia", gender: "Female", dateOfBirth: "2009-07-20",
    position: "LW", secondaryPositions: [], height: "5'1\"", gradYear: 2027, state: "CA",
    seasons: [{ year: 2025, teamName: "Bay Area Surf U17 ECNL", league: ["ECNL"], minutesPlayedPercent: 85, mainRole: "Key_Starter", gamesPlayed: 24, goals: 12, assists: 7, honors: "" }],
    academics: { graduationYear: 2027, gpa: 3.5 },
    athleticProfile: { speed: "Top_10_Percent", strength: "Above_Average", endurance: "Top_10_Percent", workRate: "Top_10_Percent", technical: "Top_10_Percent", tactical: "Top_10_Percent" },
  }),
  makeProfile({
    firstName: "Johannah", lastName: "Wallace", gender: "Female", dateOfBirth: "2012-01-05",
    position: "CAM", secondaryPositions: [], height: "5'5\"", gradYear: 2030, state: "CA",
    seasons: [{ year: 2025, teamName: "San Jose Earthquakes Girls Academy", league: ["Girls_Academy"], minutesPlayedPercent: 75, mainRole: "Key_Starter", gamesPlayed: 22, goals: 6, assists: 8, honors: "" }],
    academics: { graduationYear: 2030, gpa: 3.9 },
    athleticProfile: { speed: "Above_Average", strength: "Top_10_Percent", endurance: "Above_Average", workRate: "Top_10_Percent", technical: "Above_Average", tactical: "Top_10_Percent" },
  }),
  makeProfile({
    firstName: "Francesca", lastName: "Roland", gender: "Female", dateOfBirth: "2012-05-30",
    position: "GK", secondaryPositions: [], height: "5'6\"", gradYear: 2030, state: "CA",
    seasons: [{ year: 2025, teamName: "Atletico Santa Rosa G12", league: ["Other"], otherLeagueName: "Local Competitive", minutesPlayedPercent: 80, mainRole: "Key_Starter", gamesPlayed: 18, goals: 0, assists: 0, cleanSheets: 8, honors: "" }],
    academics: { graduationYear: 2030, gpa: 3.3 },
    athleticProfile: { speed: "Top_10_Percent", strength: "Above_Average", endurance: "Top_10_Percent", workRate: "Top_10_Percent", technical: "Above_Average", tactical: "Above_Average" },
  }),
];

// ─── Run Analysis ───────────────────────────────────────────────

async function analyzeProfile(profile) {
  const userPrompt = `
    ${SYSTEM_PROMPT}

    **Player Profile Data:**
    ${JSON.stringify(profile, null, 2)}
  `;

  const MAX_RETRIES = 1;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: userPrompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      const raw = JSON.parse(text);
      const result = validateAndNormalize(raw);
      if (result.visibilityScores.length < 5) throw new Error("Incomplete visibility scores");
      return result;
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      console.warn(`  Attempt ${attempt + 1} failed, retrying...`, error.message);
    }
  }
}

function getVis(result, level) {
  const entry = result.visibilityScores.find((v) => v.level === level);
  return entry ? Math.round(entry.visibilityPercent) : 0;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log("=" .repeat(100));
  console.log("EXPOSURE ENGINE ALGORITHM TEST — COPA Talent ID Day (Fixed Algorithm)");
  console.log("=" .repeat(100));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Model: gemini-2.5-flash | Temperature: 0.2 | Schema: enforced with enums + required`);
  console.log();

  const results = [];

  for (const profile of COPA_PROFILES) {
    const name = `${profile.firstName} ${profile.lastName}`;
    const league = profile.seasons[0]?.league?.[0] || "Unknown";

    // --- No Video ---
    console.log(`\n--- ${name} (${profile.gender}, ${profile.gradYear}, ${profile.position}, ${league}) ---`);
    console.log("  Running NO VIDEO...");
    const noVidProfile = { ...profile, videoType: "None" };
    let noVidResult;
    try {
      noVidResult = await analyzeProfile(noVidProfile);
      console.log(`  No-Video: D1=${getVis(noVidResult, "D1")}  D2=${getVis(noVidResult, "D2")}  D3=${getVis(noVidResult, "D3")}  NAIA=${getVis(noVidResult, "NAIA")}  JUCO=${getVis(noVidResult, "JUCO")}`);
      console.log(`  Readiness: Ath=${noVidResult.readinessScore.athletic} Tech=${noVidResult.readinessScore.technical} Tac=${noVidResult.readinessScore.tactical} Acad=${noVidResult.readinessScore.academic} Mkt=${noVidResult.readinessScore.market}`);
      console.log(`  Funnel: ${noVidResult.funnelAnalysis.stage} | ${noVidResult.funnelAnalysis.bottleneck}`);
    } catch (err) {
      console.error(`  ERROR (no-vid): ${err.message}`);
      noVidResult = null;
    }

    // --- With Video ---
    console.log("  Running WITH VIDEO (Edited Highlight Reel)...");
    const vidProfile = { ...profile, videoType: "Edited_Highlight_Reel" };
    let vidResult;
    try {
      vidResult = await analyzeProfile(vidProfile);
      console.log(`  Video:    D1=${getVis(vidResult, "D1")}  D2=${getVis(vidResult, "D2")}  D3=${getVis(vidResult, "D3")}  NAIA=${getVis(vidResult, "NAIA")}  JUCO=${getVis(vidResult, "JUCO")}`);
      console.log(`  Readiness: Ath=${vidResult.readinessScore.athletic} Tech=${vidResult.readinessScore.technical} Tac=${vidResult.readinessScore.tactical} Acad=${vidResult.readinessScore.academic} Mkt=${vidResult.readinessScore.market}`);
      console.log(`  Funnel: ${vidResult.funnelAnalysis.stage} | ${vidResult.funnelAnalysis.bottleneck}`);
    } catch (err) {
      console.error(`  ERROR (vid): ${err.message}`);
      vidResult = null;
    }

    // --- Compare ---
    if (noVidResult && vidResult) {
      const issues = [];
      for (const level of LEVELS) {
        const nv = getVis(noVidResult, level);
        const wv = getVis(vidResult, level);
        if (wv < nv) {
          issues.push(`${level}: ${nv}→${wv} (DROPPED!)`);
        }
      }
      if (issues.length > 0) {
        console.log(`  ⚠ SCORE DROP WITH VIDEO: ${issues.join(", ")}`);
      } else {
        console.log(`  ✓ Video scores >= no-video scores (correct)`);
      }

      // Check schema correctness
      const schemaIssues = [];
      if (noVidResult.visibilityScores.length !== 5) schemaIssues.push(`noVid: ${noVidResult.visibilityScores.length} vis scores`);
      if (vidResult.visibilityScores.length !== 5) schemaIssues.push(`vid: ${vidResult.visibilityScores.length} vis scores`);
      const rsKeys = ["athletic", "technical", "tactical", "academic", "market"];
      for (const key of rsKeys) {
        if (typeof noVidResult.readinessScore[key] !== "number") schemaIssues.push(`noVid readiness.${key} not number`);
        if (typeof vidResult.readinessScore[key] !== "number") schemaIssues.push(`vid readiness.${key} not number`);
      }
      if (!noVidResult.funnelAnalysis?.stage) schemaIssues.push("noVid missing funnel.stage");
      if (!vidResult.funnelAnalysis?.stage) schemaIssues.push("vid missing funnel.stage");

      if (schemaIssues.length > 0) {
        console.log(`  ⚠ SCHEMA ISSUES: ${schemaIssues.join(", ")}`);
      } else {
        console.log(`  ✓ Schema valid (5 vis, 5 readiness, funnel OK)`);
      }
    }

    results.push({ name, profile, noVidResult, vidResult });

    // Small delay between API calls to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1500));
  }

  // ─── Summary Table ──────────────────────────────────────────
  console.log("\n\n" + "=" .repeat(100));
  console.log("SUMMARY TABLE — Visibility Scores (No Video → With Video)");
  console.log("=" .repeat(100));
  console.log(
    "Player".padEnd(25) +
    "Grad".padEnd(6) +
    "League".padEnd(15) +
    "D1(nv→v)".padEnd(14) +
    "D2(nv→v)".padEnd(14) +
    "D3(nv→v)".padEnd(14) +
    "NAIA(nv→v)".padEnd(14) +
    "JUCO(nv→v)".padEnd(14) +
    "Drops?"
  );
  console.log("-".repeat(110));

  let totalDrops = 0;
  let totalSchemaFails = 0;

  for (const { name, profile, noVidResult, vidResult } of results) {
    if (!noVidResult || !vidResult) {
      console.log(`${name.padEnd(25)} ERROR — one or both runs failed`);
      totalSchemaFails++;
      continue;
    }

    let hasDrops = false;
    const cols = [];
    for (const level of LEVELS) {
      const nv = getVis(noVidResult, level);
      const wv = getVis(vidResult, level);
      const drop = wv < nv;
      if (drop) { hasDrops = true; totalDrops++; }
      cols.push(`${nv}→${wv}${drop ? "!" : ""}`.padEnd(14));
    }

    const league = profile.seasons[0]?.league?.[0] || "?";
    console.log(
      name.padEnd(25) +
      String(profile.gradYear).padEnd(6) +
      league.padEnd(15) +
      cols.join("") +
      (hasDrops ? "YES" : "OK")
    );
  }

  // ─── Readiness Summary ──────────────────────────────────────
  console.log("\n\n" + "=" .repeat(100));
  console.log("READINESS SCORES (No Video)");
  console.log("=" .repeat(100));
  console.log(
    "Player".padEnd(25) +
    "Athletic".padEnd(10) +
    "Technical".padEnd(10) +
    "Tactical".padEnd(10) +
    "Academic".padEnd(10) +
    "Market".padEnd(10)
  );
  console.log("-".repeat(75));
  for (const { name, noVidResult } of results) {
    if (!noVidResult) continue;
    const rs = noVidResult.readinessScore;
    console.log(
      name.padEnd(25) +
      String(rs.athletic).padEnd(10) +
      String(rs.technical).padEnd(10) +
      String(rs.tactical).padEnd(10) +
      String(rs.academic).padEnd(10) +
      String(rs.market).padEnd(10)
    );
  }

  // ─── Determinism Test (run Brayden 3x) ──────────────────────
  console.log("\n\n" + "=" .repeat(100));
  console.log("DETERMINISM TEST — Brayden Shen (no video) x3 runs");
  console.log("=" .repeat(100));

  const brayden = COPA_PROFILES[1];
  const braydenRuns = [];
  for (let i = 0; i < 3; i++) {
    try {
      const r = await analyzeProfile({ ...brayden, videoType: "None" });
      const scores = LEVELS.map((l) => `${l}=${getVis(r, l)}`).join("  ");
      console.log(`  Run ${i + 1}: ${scores}`);
      braydenRuns.push(LEVELS.map((l) => getVis(r, l)));
    } catch (err) {
      console.log(`  Run ${i + 1}: ERROR — ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  if (braydenRuns.length >= 2) {
    let maxDelta = 0;
    for (let li = 0; li < LEVELS.length; li++) {
      const vals = braydenRuns.map((r) => r[li]);
      const delta = Math.max(...vals) - Math.min(...vals);
      if (delta > maxDelta) maxDelta = delta;
    }
    console.log(`  Max score variance across runs: ${maxDelta}% ${maxDelta <= 5 ? "(PASS — within 5%)" : maxDelta <= 10 ? "(MARGINAL)" : "(FAIL — too much variance)"}`);
  }

  // ─── Final Verdict ──────────────────────────────────────────
  console.log("\n\n" + "=" .repeat(100));
  console.log("FINAL VERDICT");
  console.log("=" .repeat(100));
  console.log(`Schema failures: ${totalSchemaFails}/10`);
  console.log(`Score drops with video: ${totalDrops} individual level drops`);
  console.log(`Determinism: ${braydenRuns.length >= 2 ? "tested" : "skipped"}`);

  if (totalSchemaFails === 0 && totalDrops === 0) {
    console.log("\n✓ ALL TESTS PASSED — Algorithm fix is working correctly");
  } else {
    console.log("\n⚠ ISSUES REMAIN — Review above for details");
  }
}

main().catch(console.error);
