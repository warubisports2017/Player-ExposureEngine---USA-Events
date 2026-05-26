// Sentry instrumentation for exposure-engine serverless routes.
//
// LAZY + side-effect-free at import. Importing this file does NOT load
// @sentry/node and does NOT run any OpenTelemetry auto-instrumentation.
//
// Why: @sentry/node v10 sets up OTel auto-instrumentation as an import/init side
// effect. In Vercel's bundled serverless functions that ALSO load an HTTP-using
// package (@supabase/supabase-js on /api/health + /api/feedback, @google/genai on
// /api/analyze), that instrumentation crashed the function at MODULE LOAD ->
// every request 500'd (FUNCTION_INVOCATION_FAILED) before the handler ran.
// /api/scout-referral survived only because it imports sentry alone. Surfaced
// 2026-05-25 by the warubi-hq watchdog (health 500, 29 consecutive failures).
//
// Fix: @sentry/node is imported + init'd lazily on the FIRST capture call, inside
// try/catch, with tracing + default integrations OFF (no OTel). The happy path
// never touches @sentry/node, so routes can't crash from it; error capture still
// works when something actually goes wrong.

type AnySentry = typeof import('@sentry/node');
type Level = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

let _sentry: AnySentry | null = null;
let _inited = false;

async function getSentry(): Promise<AnySentry | null> {
  if (!process.env.SENTRY_DSN) return null;
  try {
    if (!_sentry) _sentry = await import('@sentry/node');
    if (!_inited) {
      _sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.VERCEL_ENV || 'development',
        // Vercel auto-injects VERCEL_GIT_COMMIT_SHA. Tags every event with the
        // commit so Sentry can auto-resolve "fixed in release X" issues.
        release: process.env.VERCEL_GIT_COMMIT_SHA,
        tracesSampleRate: 0,           // no tracing -> no OTel auto-instrumentation
        defaultIntegrations: false,    // belt-and-suspenders: no auto HTTP/OTel hooks
        sendDefaultPii: false,
      });
      _inited = true;
    }
    return _sentry;
  } catch {
    return null;
  }
}

const PII_FIELD_KEYS = new Set<string>([
  'email', 'phone', 'name', 'firstName', 'lastName', 'fullName',
  'parentEmail', 'parentName',
  'password', 'token', 'apiKey', 'api_key', 'authorization',
  'profile', 'highlight_url', 'video_url',
  'ip', 'ip_address', 'user_id',
]);

function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (PII_FIELD_KEYS.has(k) && v !== null && v !== undefined && v !== '') {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object') {
      out[k] = sanitize(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function captureException(err: unknown, context?: Record<string, unknown>): Promise<void> {
  const S = await getSentry();
  if (!S) return;
  try {
    S.withScope((scope) => {
      if (context) scope.setContext('exposure', sanitize(context) as Record<string, unknown>);
      S.captureException(err);
    });
  } catch {
    // swallow
  }
}

export async function captureMessage(
  message: string,
  level: Level = 'warning',
  context?: Record<string, unknown>
): Promise<void> {
  const S = await getSentry();
  if (!S) return;
  try {
    S.withScope((scope) => {
      scope.setLevel(level);
      if (context) scope.setContext('exposure', sanitize(context) as Record<string, unknown>);
      S.captureMessage(message);
    });
  } catch {
    // swallow
  }
}

export async function flush(timeoutMs = 2000): Promise<boolean> {
  if (!_sentry || !process.env.SENTRY_DSN) return true;
  try {
    return await _sentry.flush(timeoutMs);
  } catch {
    return false;
  }
}
