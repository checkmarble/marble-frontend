import { describe, expect, it } from 'vitest';
import { createEnumEntry, enumEntriesSchema } from './enum';
import {
  type EnumField,
  isEnumField,
  resolveCountry,
  resolveCountryCodeFormat,
  resolveEnumDisplay,
  resolveEnumValues,
} from './enum-values';

const base: EnumField = { dataType: 'String', isEnum: false, semanticType: 'enum', values: ['legacy'] };
const entries = [
  { key: 'approved', color: 'green' },
  { key: 'other', color: 'gray' },
] as const;
const keyed: EnumField = { ...base, semanticSubType: 'key_color_value', enumValues: [...entries] };

describe('enum values', () => {
  it('recognizes either legacy or semantic enums', () => {
    expect(isEnumField(base)).toBe(true);
    expect(isEnumField({ isEnum: true })).toBe(true);
    expect(isEnumField({ isEnum: false, semanticType: 'text' })).toBe(false);
  });
  it.each([undefined, 'autocomplete', 'mcc_code'] as const)(
    'uses API values and permits custom values for %s',
    (semanticSubType) => {
      expect(resolveEnumValues({ ...base, semanticSubType }, ['custom'])).toEqual({
        closed: false,
        values: ['legacy', 'custom'],
      });
      expect(resolveEnumDisplay({ ...base, semanticSubType }, '5219', 'en').label).toBe('5219');
    },
  );
  it('uses the currency catalog with rule-local values', () => {
    const field = { ...base, semanticSubType: 'currency' as const };
    expect(resolveEnumValues(field, ['CUSTOM']).values).toEqual(expect.arrayContaining(['EUR', 'USD', 'CUSTOM']));
    expect(resolveEnumValues(field).closed).toBe(false);
    expect(resolveEnumDisplay(field, 'EUR', 'en').label).toContain('Euro');
  });
  it('keeps key/color closed and resolves only presentation through the final entry', () => {
    expect(resolveEnumValues(keyed, ['stale'])).toEqual({ closed: true, values: ['approved', 'other'] });
    expect(resolveEnumDisplay(keyed, 'approved', 'en')).toEqual({ label: 'approved', color: 'green' });
    expect(resolveEnumDisplay(keyed, 'stale', 'en')).toEqual({ label: 'other', color: 'gray' });
    expect(resolveEnumDisplay({ ...keyed, enumValues: [entries[0]] }, 'stale', 'en')).toEqual({
      label: 'approved',
      color: 'green',
    });
  });
  it('starts new entries with an empty key for the user to enter', () => {
    expect(createEnumEntry()).toEqual({ key: '', color: 'gray' });
    expect(enumEntriesSchema.safeParse([createEnumEntry()]).success).toBe(false);
  });
  it.each([
    undefined,
    [],
    [{ key: '', color: 'red' }],
    [{ key: 'x', color: 'bad' }],
    [{ key: 'x' }],
    [entries[0], entries[0]],
  ])('rejects incomplete or duplicate definitions: %j', (entries) => {
    expect(enumEntriesSchema.safeParse(entries).success).toBe(false);
  });
  it('validates keys without rewriting their stored identity', () => {
    expect(enumEntriesSchema.parse([{ key: ' existing key ', color: 'green' }])[0]?.key).toBe(' existing key ');
  });
  it('keeps numeric enum values and display raw', () => {
    const field: EnumField = { ...keyed, dataType: 'Int', values: [0, 1, 10000] };
    expect(resolveEnumValues(field).values).toEqual([0, 1, 10000]);
    expect(resolveEnumDisplay(field, 10000, 'fr')).toEqual({ label: '10000' });
  });
});

describe('country formats', () => {
  const field: EnumField = { ...base, semanticSubType: 'country', values: [] };
  it('uses explicit format, unambiguous inference, then alpha2', () => {
    expect(resolveCountryCodeFormat({ ...field, countryCodeFormat: 'alpha2', values: ['FRA'] })).toBe('alpha2');
    expect(resolveCountryCodeFormat({ ...field, values: ['FRA', 'USA'] })).toBe('alpha3');
    expect(resolveCountryCodeFormat(field, ['FRA'])).toBe('alpha3');
    expect(resolveCountryCodeFormat(field, ['FR', 'USA'])).toBe('alpha2');
    expect(resolveCountryCodeFormat(field, ['invalid'])).toBe('alpha2');
  });
  it('offers a closed catalog encoded in the selected format', () => {
    const resolved = resolveEnumValues({ ...field, countryCodeFormat: 'alpha3' }, ['stale']);
    expect(resolved.closed).toBe(true);
    expect(resolved.values).toContain('FRA');
    expect(resolved.values).not.toContain('FR');
    expect(resolved.values).not.toContain('stale');
    expect(resolved.values.every((value) => typeof value === 'string' && /^[A-Z]{3}$/.test(value))).toBe(true);
    for (const value of resolved.values) expect(() => resolveEnumDisplay(field, value, 'en')).not.toThrow();
  });
  it('displays either format independently of metadata and localizes names', () => {
    expect(resolveCountry('FR')).toEqual(resolveCountry('fra'));
    expect(resolveEnumDisplay(field, 'FRA', 'fr')).toMatchObject({ label: 'France', flag: '🇫🇷' });
    expect(resolveEnumDisplay(field, 'DE', 'fr').label).toBe('Allemagne');
    expect(resolveEnumDisplay(field, 'ZZZ', 'en')).toEqual({ label: 'ZZZ', neutral: true });
  });
});
