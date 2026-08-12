import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';
import { buildPostHogOptions } from './src/lib/posthog-scrub';
import './src/index.css';
import App from './App';

// PostHog client init with PII scrub. Replaces the inline snippet that
// previously lived in index.html (leaked any URL-embedded params via
// $current_url + $referrer). Public-facing app with no auth → autocapture
// only, no identify, no allowPII opt-in. Same project as the rest of the
// Warubi network (370781). GA4 stays in index.html (server-side, no PII).
posthog.init('phc_ye5SfajjJFkrj8C8cExzZG34ft4Xha8LjNiHc6RYaavL', buildPostHogOptions({
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
  session_recording: {
    // This public athlete form collects names, email, birth date, GPA, and
    // playing history. Replays must never capture any entered value.
    maskAllInputs: true,
    maskInputFn: (text: string, element?: HTMLElement) => {
      return '*'.repeat(text.length);
    },
  },
}));
if (typeof window !== 'undefined' && localStorage.getItem('ph_internal') === '1') {
  posthog.opt_out_capturing();
}

// Sentry client init - silently no-ops when VITE_SENTRY_DSN is unset
// (local dev, preview branches without DSN). Production gets the DSN via
// Vercel env. Mirrors scout-portal pattern. No PostHog identify on this
// app — exposure-engine is an unauthenticated public tool (no signin),
// so we rely on PostHog autocapture for behavior tracking.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE || undefined,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    // Privacy: scrub PII before any event leaves the browser. The exposure
    // form collects athlete names/emails which never go to a third-party.
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
