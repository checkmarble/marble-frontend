import { tracfinValidationFixture } from '@app-builder/models/tracfin/__fixtures__';
import { describe, expect, it } from 'vitest';
import { isValidationStale, tagValidationDiagnostics } from './review-state';

describe('validation run against the draft revision', () => {
  const run = { revision: 3, validation: tracfinValidationFixture };

  it('is current at the revision it ran on, stale once the draft moved, and nothing without a run', () => {
    expect(isValidationStale(run, 3)).toBe(false);
    expect(isValidationStale(run, 4)).toBe(true);
    expect(isValidationStale(null, 4)).toBe(false);
  });

  it('feeds the diagnostics to the blocks untouched while current, flagged stale afterwards', () => {
    expect(tagValidationDiagnostics(run, 3)).toEqual(tracfinValidationFixture.diagnostics);
    expect(tagValidationDiagnostics(run, 3).some((diagnostic) => 'stale' in diagnostic)).toBe(false);
    const stale = tagValidationDiagnostics(run, 5);
    expect(stale).toHaveLength(tracfinValidationFixture.diagnostics?.length ?? -1);
    expect(stale.every((diagnostic) => diagnostic.stale === true)).toBe(true);
  });

  it('tolerates the null diagnostics list Go writes for an empty slice', () => {
    expect(
      tagValidationDiagnostics({ revision: 3, validation: { ...tracfinValidationFixture, diagnostics: null } }, 3),
    ).toEqual([]);
    expect(tagValidationDiagnostics(null, 3)).toEqual([]);
  });
});
