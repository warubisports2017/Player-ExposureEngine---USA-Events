import '../lib/sentry';
/**
 * Serverless function to submit feedback to Athletes USA Supabase.
 * Cross-project write using submit_external_feedback RPC (same pattern as ITP Hub).
 */

import { createClient } from '@supabase/supabase-js'

const AUSA_URL = 'https://wwomwawpxmkrykybpqok.supabase.co'
const AUSA_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3b213YXdweG1rcnlreWJwcW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODI4MTYsImV4cCI6MjA4MTk1ODgxNn0.roOc55fapdrydH1hM889FpwFkLc2ymzfQHiEiWl_KoQ'

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { message, type, email } = req.body || {}

  if (!message || typeof message !== 'string' || message.length > 5000) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  try {
    const ausa = createClient(AUSA_URL, AUSA_ANON_KEY)

    const { data, error } = await ausa.rpc('submit_external_feedback', {
      p_message: message.trim(),
      p_type: type || 'Other',
      p_page: 'exposure_engine',
      p_user_email: email?.trim() || null,
      p_screenshot_urls: null,
    })

    if (error) throw error

    const result = data as { success: boolean; error?: string }
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    return res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('Feedback submission error:', err)
    return res.status(500).json({ error: err.message || 'Failed to submit feedback' })
  }
}
