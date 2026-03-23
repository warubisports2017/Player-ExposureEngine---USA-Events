/**
 * Scout Referral - Creates a prospect in the scout's pipeline
 * when a player completes an Exposure Engine analysis via ?ref=<scoutId>
 *
 * Best-effort: never blocks or fails the analysis response.
 */

const POSITION_MAP: Record<string, string> = {
  GK: 'Goalkeeper',
  CB: 'Center Back',
  LB: 'Left Back',
  RB: 'Right Back',
  CDM: 'Defensive Midfielder',
  CM: 'Central Midfielder',
  CAM: 'Attacking Midfielder',
  LW: 'Left Wing',
  RW: 'Right Wing',
  ST: 'Striker',
};

function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob + 'T12:00:00');
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export async function createScoutProspect(profile: any, result: any): Promise<void> {
  const scoutId = profile.referralScoutId;
  if (!scoutId) return;

  const url = process.env.SCOUT_SUPABASE_URL;
  const serviceKey = process.env.SCOUT_SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) {
    console.warn('Scout referral: missing SCOUT_SUPABASE_URL or SCOUT_SUPABASE_SERVICE_KEY');
    return;
  }

  // Find best visibility score
  const visScores = Array.isArray(result.visibilityScores) ? result.visibilityScores : [];
  const bestVis = visScores.reduce(
    (best: any, v: any) => (v.visibilityPercent > (best?.visibilityPercent ?? 0) ? v : best),
    visScores[0] || null
  );

  // Build best fit summary from top 2 levels
  const sorted = [...visScores].sort((a: any, b: any) => b.visibilityPercent - a.visibilityPercent);
  const bestFitSummary = sorted
    .slice(0, 2)
    .map((v: any) => `${v.level}: ${v.visibilityPercent}%`)
    .join(', ');

  // Get latest season club name
  const latestSeason = Array.isArray(profile.seasons) && profile.seasons.length > 0
    ? profile.seasons.reduce((a: any, b: any) => (b.year >= a.year ? b : a))
    : null;

  const prospect = {
    scout_id: scoutId,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    email: profile.email || null,
    position: POSITION_MAP[profile.position] || profile.position,
    age: calculateAge(profile.dateOfBirth),
    dominant_foot: profile.dominantFoot,
    nationality: Array.isArray(profile.citizenship)
      ? profile.citizenship.join(', ')
      : profile.citizenship || null,
    gpa: profile.academics?.gpa ?? null,
    grad_year: profile.gradYear ?? null,
    date_of_birth: profile.dateOfBirth || null,
    height: profile.height || null,
    club: latestSeason?.teamName || null,
    evaluation: {
      source: 'exposure_engine',
      visibility_scores: Object.fromEntries(
        visScores.map((v: any) => [v.level, v.visibilityPercent])
      ),
      readiness_score: result.readinessScore || {},
      key_strengths: result.keyStrengths || [],
      key_risks: (result.keyRisks || []).map((r: any) => ({
        category: r.category,
        message: r.message,
        severity: r.severity,
      })),
      summary: result.plainLanguageSummary || '',
      coach_evaluation: result.coachShortEvaluation || '',
      best_fit: bestFitSummary,
    },
    status: 'lead',
    activity_status: 'spark',
    notes: `Best fit: ${bestFitSummary}. ${bestVis ? `Top level: ${bestVis.level} at ${bestVis.visibilityPercent}%` : ''}`.trim(),
  };

  const response = await fetch(`${url}/rest/v1/scout_prospects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(prospect),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.warn(`Scout referral: POST failed (${response.status}): ${body}`);
  }
}
