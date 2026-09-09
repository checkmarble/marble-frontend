import { describe, expect, it } from 'vitest';
import { createEnumEntry, enumEntriesSchema } from './enum';
import {
  type EnumField,
  getResolvedEnumValues,
  isEnumField,
  resolveCountry,
  resolveCountryCodeFormat,
  resolveEnumDisplay,
  resolveEnumValues,
  resolveMcc,
} from './enum-values';

const base: EnumField = { dataType: 'String', isEnum: false, semanticType: 'enum', values: ['legacy'] };
const entries = [
  { key: 'approved', color: '#46BB7F' },
  { key: 'other', color: '#838292' },
] as const;
const keyed: EnumField = { ...base, semanticSubType: 'key_color_value', enumValues: [...entries] };

describe('enum values', () => {
  it('recognizes either legacy or semantic enums', () => {
    expect(isEnumField(base)).toBe(true);
    expect(isEnumField({ isEnum: true })).toBe(true);
    expect(isEnumField({ isEnum: false, semanticType: 'text' })).toBe(false);
  });
  it.each([undefined, 'autocomplete'] as const)(
    'uses API values and permits custom values for %s',
    (semanticSubType) => {
      expect(resolveEnumValues({ ...base, semanticSubType }, ['custom'])).toEqual({
        closed: false,
        values: ['legacy', 'custom'],
      });
      expect(resolveEnumDisplay({ ...base, semanticSubType }, '5219', 'en').label).toBe('5219');
    },
  );
  it('uses the MCC catalog with custom values and padded lookup', () => {
    const field: EnumField = { ...base, semanticSubType: 'mcc_code', values: [] };
    expect(resolveEnumValues(field).closed).toBe(false);
    expect(resolveEnumValues(field).values).toEqual(expect.arrayContaining(['5411', '0742']));
    expect(resolveEnumValues(field, ['742']).values).toContain('0742');
    expect(resolveEnumValues(field, ['742']).values).not.toContain('742');
    expect(resolveEnumValues(field, ['9999']).values).toEqual(expect.arrayContaining(['5411', '9999']));
    expect(resolveEnumDisplay(field, '5411', 'en').label).toBe('5411 – Grocery Stores, Supermarkets');
    expect(resolveEnumDisplay(field, '742', 'en').label).toBe('0742 – Veterinary Services');
    expect(resolveEnumDisplay(field, '0742', 'en').label).toBe('0742 – Veterinary Services');
    expect(resolveEnumDisplay(field, '9999', 'en').label).toBe('9999');
    expect(resolveMcc('742')).toEqual({ code: '0742', description: 'Veterinary Services' });
  });
  it('resolves catalog values from a semantic enum field without isEnum', () => {
    const field = {
      id: 'mcc',
      tableId: 'tx',
      name: 'mcc',
      description: '',
      nullable: false,
      isEnum: false,
      semanticType: 'enum' as const,
      semanticSubType: 'mcc_code' as const,
      dataType: 'String' as const,
      unicityConstraint: 'no_unicity_constraint' as const,
    };
    expect(
      getResolvedEnumValues(
        [
          {
            id: 'tx',
            name: 'transactions',
            description: '',
            semanticType: null,
            alias: '',
            captionField: '',
            fields: [field],
            linksToSingle: [],
            fieldOrder: ['mcc'],
          },
        ],
        'transactions',
        'mcc',
      ),
    ).toEqual(expect.arrayContaining(['5411', '0742']));
  });
  it('uses the currency catalog with rule-local values', () => {
    const field = { ...base, semanticSubType: 'currency' as const };
    expect(resolveEnumValues(field, ['CUSTOM']).values).toEqual(expect.arrayContaining(['EUR', 'USD', 'CUSTOM']));
    expect(resolveEnumValues(field).closed).toBe(false);
    expect(resolveEnumDisplay(field, 'EUR', 'en').label).toBe('EUR – Euro');
    expect(resolveEnumDisplay(field, '978', 'en').label).toBe('978 – Euro');
    const numeric = { ...field, currencyCodeFormat: 'Number' as const };
    expect(resolveEnumValues(numeric, ['999']).values).toEqual(expect.arrayContaining(['978', '840', '999']));
    expect(resolveEnumValues(numeric).values).not.toContain('EUR');
    expect(resolveEnumDisplay(numeric, '978', 'en').label).toBe('978 – Euro');
    expect(resolveEnumDisplay(numeric, 'EUR', 'en').label).toBe('978 – Euro');
  });
  it('keeps key/color closed and resolves only presentation through the final entry', () => {
    expect(resolveEnumValues(keyed, ['stale'])).toEqual({ closed: true, values: ['approved', 'other'] });
    expect(resolveEnumDisplay(keyed, 'approved', 'en')).toEqual({ label: 'approved', color: '#46BB7F' });
    expect(resolveEnumDisplay(keyed, 'stale', 'en')).toEqual({ label: 'other', color: '#838292' });
    expect(resolveEnumDisplay({ ...keyed, enumValues: [entries[0]] }, 'stale', 'en')).toEqual({
      label: 'approved',
      color: '#46BB7F',
    });
  });
  it('starts new entries with an empty key for the user to enter', () => {
    expect(createEnumEntry()).toEqual({ key: '', color: '#88DCDE' });
    expect(enumEntriesSchema.safeParse([createEnumEntry()]).success).toBe(false);
  });
  it.each([
    undefined,
    [],
    [{ key: '', color: '#DB5F4A' }],
    [{ key: 'x', color: 'bad' }],
    [{ key: 'x' }],
    [entries[0], entries[0]],
  ])('rejects incomplete or duplicate definitions: %j', (entries) => {
    expect(enumEntriesSchema.safeParse(entries).success).toBe(false);
  });
  it('validates keys without rewriting their stored identity', () => {
    expect(enumEntriesSchema.parse([{ key: ' existing key ', color: '#46BB7F' }])[0]?.key).toBe(' existing key ');
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
