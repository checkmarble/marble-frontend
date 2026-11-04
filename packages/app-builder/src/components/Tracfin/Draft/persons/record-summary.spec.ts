import { describe, expect, it } from 'vitest';
import { isIndexUnavailable, summarizeRecord } from './record-summary';

describe('summarizeRecord', () => {
  const data = {
    object_id: 'A2',
    updated_at: '2026-01-01',
    owner_name: 'Jeanne',
    balance: 120.5,
    iban: 'FR76',
    note: null,
    empty: '  ',
    extra: 'dropped by the limit',
  };

  it('shows the id, the caption when it differs from the id, and at most three other fields', () => {
    const summary = summarizeRecord(data, { captionField: 'owner_name' });
    expect(summary.recordId).toBe('A2');
    expect(summary.caption).toBe('Jeanne');
    expect(summary.fields).toEqual([
      { name: 'balance', value: '120.5' },
      { name: 'iban', value: 'FR76' },
      { name: 'extra', value: 'dropped by the limit' },
    ]);
  });

  it('follows the order of the data model and never shows the technical timestamps', () => {
    const summary = summarizeRecord(data, { fieldOrder: ['iban', 'balance'] });
    expect(summary.caption).toBeNull();
    expect(summary.fields.map((field) => field.name)).toEqual(['iban', 'balance', 'owner_name']);
  });
});

describe('isIndexUnavailable', () => {
  it('recognises the diagnostic the server sends instead of a list', () => {
    expect(
      isIndexUnavailable({
        diagnostics: [{ code: 'NAVIGATION_INDEX_UNAVAILABLE', layer: 'sources', severity: 'warning', message: '' }],
      }),
    ).toBe(true);
    expect(isIndexUnavailable({ diagnostics: null })).toBe(false);
  });
});
