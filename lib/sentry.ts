// Sentry instrumentation for exposure-engine serverless routes.
// Idempotent init. Silent no-op without SENTRY_DSN.
import * as Sentry from '@sentry/node';

declare global {
  // eslint-disable-next-line no-var
  var __sentry_inited_exposure_engine: boolean | undefined;
}

if (process.env.SENTRY_DSN && !globalThis.__sentry_inited_exposure_engine) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || 'development',
    // Vercel auto-injects VERCEL_GIT_COMMIT_SHA. Tags every event with the
    // commit so Sentry can auto-resolve "fixed in release X" issues.
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
  globalThis.__sentry_inited_exposure_engine = true;
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

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!process.env.SENTRY_DSN) return;
  try {
    Sentry.withScope((scope) => {
      if (context) scope.setContext('exposure', sanitize(context) as Record<string, unknown>);
      Sentry.captureException(err);
    });
  } catch {
    // swallow
  }
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'warning',
  context?: Record<string, unknown>
): void {
  if (!process.env.SENTRY_DSN) return;
  try {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      if (context) scope.setContext('exposure', sanitize(context) as Record<string, unknown>);
      Sentry.captureMessage(message);
    });
  } catch {
    // swallow
  }
}

export async function flush(timeoutMs = 2000): Promise<boolean> {
  if (!process.env.SENTRY_DSN) return true;
  try {
    return await Sentry.flush(timeoutMs);
  } catch {
    return false;
  }
}
