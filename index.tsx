import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './src/index.css';
import App from './App';

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
