import { describe, expect, it } from 'vitest';

import { getSegmentScript } from './segment.server';

describe('getSegmentScript', () => {
  it('loads segment eagerly when no consent banner is configured', () => {
    const script = getSegmentScript('WRITE_KEY_123', { deferLoad: false });

    expect(script).toContain('analytics.load("WRITE_KEY_123")');
    expect(script).toContain('analytics._writeKey="WRITE_KEY_123"');
  });

  it('renders only the buffering stub when loading is deferred to consent', () => {
    const script = getSegmentScript('WRITE_KEY_123', { deferLoad: true });

    // No `analytics.load(...)` call — the stub still defines `analytics.load=function`
    // and embeds the write key, which the consent loader relies on.
    expect(script).not.toContain('analytics.load("WRITE_KEY_123")');
    expect(script).toContain('analytics._writeKey="WRITE_KEY_123"');
  });

  it('never enables automatic page tracking', () => {
    for (const deferLoad of [true, false]) {
      expect(getSegmentScript('WRITE_KEY_123', { deferLoad })).not.toContain('analytics.page()');
    }
  });
});
