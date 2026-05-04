import '../lib/sentry';
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
    checks.canary = { ok: !error && (count ?? 0) > 0, count: count || 0 }

    if (error) status = 'degraded'
  } catch (e) {
    checks.database = { ok: false, ms: 0, error: 'unreachable' }
    checks.canary = { ok: false, count: 0 }
    status = 'down'
  }

  return res.status(status === 'down' ? 503 : 200).json({
    status,
    app: 'exposure-engine',
    timestamp: new Date().toISOString(),
    checks
  })
}
