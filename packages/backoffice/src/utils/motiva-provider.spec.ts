import { describe, expect, it } from 'vitest';
import { getMotivaMatchDataset } from './motiva-provider';

describe('getMotivaMatchDataset', () => {
  it.each([
    ['opensanctions', 'default'],
    ['lexisnexis', 'lexisnexis'],
    [undefined, 'default'],
  ] as const)('maps provider %s to the %s Motiva dataset', (provider, expectedDataset) => {
    expect(getMotivaMatchDataset(provider)).toBe(expectedDataset);
  });
});
