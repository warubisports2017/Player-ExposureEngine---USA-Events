/**
 * Canonical PostHog PII scrub helper for the Warubi network.
 *
 * THIS FILE IS THE SOURCE OF TRUTH. Apps copy it into their own src/ as
 * either posthog-scrub.js or posthog-scrub.ts (typed variant). A CI drift
 * check (separate PR) greps each app for `posthog.init(` outside the
 * canonical helper import and fails the build on divergence.
 *
 * Origin: 2026-05-23 brain-trust review (Carmack reality contact +
 * Cherny constraint engineering). Caught 3 leak surfaces the original
 * "strip $current_url only" plan missed:
 *
 *   1. session-replay tapes capture URLs separately from event props —
 *      need maskCapturedNetworkRequestFn ON TOP of before_send
 *   2. $referrer, $referring_domain, $pathname, $initial_current_url,
 *      $initial_referrer, $prev_pageview_pathname leak the SAME URLs
 *      on the next pageview after callback — need recursive walk
 *   3. PII can appear in $set / $set_once too — must walk all three
 *
 * Per-app PII discipline (per memory/posthog-identify-scope-rules.md):
 *   - athlete/coach-facing apps (coaching-courses, ausa-portal): strip all PII
 *   - staff/operator tools (scout-portal, QV4 admin): keep `email` for
 *     session-replay tooltip recognition — pass `allowPII: ['email']`
 *
 * Usage in app code:
 *
 *   import { buildPostHogOptions } from './posthog-scrub';
 *   posthog.init(DSN, buildPostHogOptions({
 *     api_host: 'https://us.i.posthog.com',
 *     person_profiles: 'identified_only',
 *     autocapture: true,
 *     capture_pageview: true,
 *     capture_pageleave: true,
 *     // optional: allowPII: ['email']  // scout-portal / QV4 admin only
 *   }));
 */

// Query-string params that frequently carry identity tokens in Warubi
// auth flows (Supabase magic-link, password reset, email change).
const SENSITIVE_QUERY_KEYS = [
  'email',
  'magiclink',
  'access_token',
  'refresh_token',
  'token',
  'code',
  'auth',
  'session',
];

// Property keys whose VALUES may contain URLs that leak PII. Recursive
// walk strips embedded auth tokens / email query params from each.
function looksLikeUrlKey(key) {
  if (typeof key !== 'string') return false;
  const k = key.toLowerCase();
  return k.includes('url') || k.includes('href') || k.includes('referrer') || k === '$pathname';
}

function scrubUrlString(value, allowPII) {
  if (typeof value !== 'string') return value;
  // Cheap pre-check: don't construct URL() on non-urls.
  if (!value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('//')) {
    return value;
  }
  try {
    const url = new URL(value, 'http://placeholder');
    for (const key of SENSITIVE_QUERY_KEYS) {
      if (allowPII && allowPII.includes(key)) continue;
      url.searchParams.delete(key);
    }
    // URL fragment is where Supabase puts JWTs (#access_token=...). Always strip.
    url.hash = '';
    // If we constructed against the placeholder origin, return a relative URL.
    if (url.origin === 'http://placeholder') {
      return url.pathname + url.search;
    }
    return url.toString();
  } catch {
    return value; // not a parseable URL — leave alone
  }
}

function scrubProperties(props, allowPII) {
  if (!props || typeof props !== 'object') return props;
  const out = Array.isArray(props) ? [...props] : { ...props };
  for (const [k, v] of Object.entries(props)) {
    if (looksLikeUrlKey(k)) {
      out[k] = scrubUrlString(v, allowPII);
    } else if (v && typeof v === 'object') {
      out[k] = scrubProperties(v, allowPII);
    }
  }
  return out;
}

/**
 * Build a PostHog init options object with the scrub helpers wired in.
 *
 * @param {object} baseOptions  - your normal posthog.init options
 * @returns options object with before_send + session_recording.maskCapturedNetworkRequestFn
 *
 * baseOptions.allowPII (optional, string[]) — query-param names to NOT strip.
 * Currently only scout-portal + QV4 admin use { allowPII: ['email'] } so
 * session-replay tooltips can show which scout/admin a recording belongs to.
 */
function buildPostHogOptions(baseOptions = {}) {
  const allowPII = baseOptions.allowPII || [];
  // Don't pass allowPII through to PostHog itself.
  const { allowPII: _ignored, session_recording, ...rest } = baseOptions;

  return {
    ...rest,
    before_send: (event) => {
      if (!event) return event;
      // Walk event.properties (where $current_url, $referrer, $pathname live)
      if (event.properties) {
        event.properties = scrubProperties(event.properties, allowPII);
      }
      // Walk $set and $set_once (person properties — same URLs can land here)
      if (event.$set) {
        event.$set = scrubProperties(event.$set, allowPII);
      }
      if (event.$set_once) {
        event.$set_once = scrubProperties(event.$set_once, allowPII);
      }
      return event;
    },
    session_recording: {
      ...(session_recording || {}),
      // Strip the same auth-token query params + URL fragment from any
      // network request URL captured into the replay timeline. Without
      // this, `before_send` scrubs events but the replay tape still
      // contains the leaking URLs.
      maskCapturedNetworkRequestFn: (request) => {
        if (request && request.name) {
          request.name = scrubUrlString(request.name, allowPII);
        }
        if (request && request.initiator) {
          request.initiator = scrubUrlString(request.initiator, allowPII);
        }
        return request;
      },
      // Preserve any pre-existing input-mask rules from baseOptions
      maskAllInputs: session_recording?.maskAllInputs ?? false,
      maskInputFn: session_recording?.maskInputFn,
    },
  };
}

// ES module exports — works natively in Vite, Next.js, and modern Node
// (>=12 with .mjs or "type":"module"). For the CI drift check, use
// dynamic import: `const { buildPostHogOptions } = await import('./posthog-scrub.js')`.
export {
  buildPostHogOptions,
  scrubUrlString,
  scrubProperties,
  SENSITIVE_QUERY_KEYS,
  looksLikeUrlKey,
};
