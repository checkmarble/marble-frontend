import { describe, expect, it } from 'vitest';
import { safeRedirect } from './safe-redirect';

describe('safeRedirect', () => {
  it.each(['/cases', '/cases/1?tab=rules#top', '/'])('keeps the same-origin path %s', (to) => {
    expect(safeRedirect(to, '/default')).toBe(to);
  });

  it.each([
    null,
    undefined,
    '',
    'cases',
    'https://attacker.example',
    '//attacker.example',
    '/\\attacker.example',
    '\\\\attacker.example',
    '/\t/attacker.example',
    '/\n/attacker.example',
    '/\r/attacker.example',
    '/\\\t/attacker.example',
    '\t//attacker.example',
    '//safe-redirect.invalid',
    '/\\safe-redirect.invalid',
  ])('falls back for %j', (to) => {
    expect(safeRedirect(to, '/default')).toBe('/default');
  });
});
