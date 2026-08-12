import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { buildPostHogOptions } from '../src/lib/posthog-scrub.js';

test('PostHog session replay masks every athlete form input', async () => {
  const entrypoint = await readFile(new URL('../index.tsx', import.meta.url), 'utf8');
  assert.match(entrypoint, /maskAllInputs:\s*true/);
  assert.doesNotMatch(entrypoint, /return\s+text\s*;/);

  const options = buildPostHogOptions({ session_recording: { maskAllInputs: true } });
  assert.equal(options.session_recording.maskAllInputs, true);
});

test('PostHog strips sensitive query parameters and URL fragments', () => {
  const options = buildPostHogOptions({ session_recording: { maskAllInputs: true } });
  const event = options.before_send({
    properties: {
      $current_url: 'https://app.warubi-sports.com/?email=test%40example.com&ref=scout#access_token=secret',
    },
  });

  assert.equal(event.properties.$current_url, 'https://app.warubi-sports.com/?ref=scout');
});
