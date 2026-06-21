// NOTE: do NOT `import '../lib/sentry'` here. @sentry/node v10's OTel auto-
// instrumentation, when bundled into a serverless fn that also loads
// @supabase/supabase-js, crashes the fn at module load. See lib/sentry.ts.
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const checks: Record<string, any> = {}
  let status = 'ok'

  try {
    const start = Date.now()
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { count, error } = await supabase
      .from('website_leads')
      .select('*', { count: 'exact', head: true })

    checks.database = { ok: !error, ms: Date.now() - start }
    // Canary smoke test: website_leads is the app's cumulative lead table - it is
    // never pruned, so rows only accumulate over time. count === 0 is NOT a normal
    // short-window condition here; it signals something genuinely wrong (wrong DB,
    // wrong table, or RLS blocking reads). So ok requires a successful query AND
    // at least one row. This is a non-critical check: a failing canary degrades
    // (not errors) the overall status so external monitoring still notices.
    checks.canary = { ok: !error && (count ?? 0) > 0, count: count || 0 }

    // Honest top-level status: a database failure is the hard error; any
    // non-critical sub-check failure (e.g. canary) degrades but does not 5xx.
    if (error) {
      status = 'error'
    } else if (!checks.canary.ok) {
      status = 'degraded'
    }
  } catch (e) {
    checks.database = { ok: false, ms: 0, error: 'unreachable' }
    checks.canary = { ok: false, count: 0 }
    status = 'down'
  }

  // database failure (error / down) -> 503 so monitoring catches it; a healthy
  // database with only a degraded canary stays 200 (the canary signal lives in
  // status: 'degraded' and checks.canary.ok for monitors that inspect the body).
  const httpStatus = (status === 'down' || status === 'error') ? 503 : 200
  return res.status(httpStatus).json({
    status,
    app: 'exposure-engine',
    timestamp: new Date().toISOString(),
    checks
  })
}
