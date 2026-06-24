import { describe, expect, it } from 'vitest';
import { decodeClientDetailObjectIdParam, encodeClientDetailObjectIdParam } from './client-detail-url';

describe('client-detail-url', () => {
  it('keeps ids without slashes unchanged', () => {
    expect(encodeClientDetailObjectIdParam('abc-123')).toBe('abc-123');
    expect(decodeClientDetailObjectIdParam('abc-123')).toBe('abc-123');
  });

  it('encodes ids containing slashes as a single path segment', () => {
    const encoded = encodeClientDetailObjectIdParam('/test');
    expect(encoded).not.toContain('/');
    expect(encoded.startsWith('b64.')).toBe(true);
    expect(decodeClientDetailObjectIdParam(encoded)).toBe('/test');
  });

  it('round-trips unicode ids with slashes', () => {
    const objectId = '/données/été';
    const encoded = encodeClientDetailObjectIdParam(objectId);
    expect(encoded).not.toContain('/');
    expect(decodeClientDetailObjectIdParam(encoded)).toBe(objectId);
  });
});
