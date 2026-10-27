import { describe, expect, it } from 'vitest';
import { catalogProfileFixture } from './__fixtures__/catalog.fixture';
import { createTracfinCatalogIndex, getTracfinCatalogIndex } from './catalog-index';
import type { TracfinProfile } from './index';

const index = getTracfinCatalogIndex(catalogProfileFixture);

const ids = (entries: readonly { field: { id: string } }[]) => entries.map(({ field }) => field.id);

describe('fieldsOf', () => {
  it('separates child blocks, scalar fields and block attributes, in catalog order', () => {
    const address = index.fieldsOf('/ds/organisme/adresse');
    expect(address.blocks).toEqual([]);
    expect(address.attributes).toEqual([]);
    expect(ids(address.fields)).toEqual([
      '/ds/organisme/adresse/type',
      '/ds/organisme/adresse/nomVoie',
      '/ds/organisme/adresse/codePostal',
      '/ds/organisme/adresse/ville',
      '/ds/organisme/adresse/pays',
    ]);
    expect(ids(index.fieldsOf('/ds').blocks)).toEqual([
      '/ds/organisme',
      '/ds/personnes',
      '/ds/operations',
      '/ds/pieceJointe',
    ]);
  });

  it('keeps the attribute of a scalar field out of the block fields', () => {
    expect(ids(index.fieldsOf('/ds/organisme/adresse').fields)).not.toContain('/ds/organisme/adresse/pays/@type');
    expect(index.field('/ds/organisme/adresse/pays/@type')?.attribute).toBe(true);
  });

  it('returns the attributes carried by a block itself (card number)', () => {
    const card = index.fieldsOf('/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire');
    expect(card.blocks).toEqual([]);
    expect(card.fields).toEqual([]);
    expect(card.attributes.map(({ field }) => field.name)).toEqual(['id', 'lien', 'numeroCarteBancaire']);
  });

  it('flags calculated nodes instead of dropping them', () => {
    const card = index.fieldsOf('/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire');
    expect(card.attributes.map(({ field, calculated }) => [field.name, calculated])).toEqual([
      ['id', true],
      ['lien', false],
      ['numeroCarteBancaire', false],
    ]);
    const piece = index.fieldsOf('/ds/pieceJointe/piece');
    expect(piece.fields.find(({ field }) => field.name === 'contenu')?.calculated).toBe(true);
    expect(piece.fields.find(({ field }) => field.name === 'nom')?.calculated).toBe(false);
    expect(piece.attributes.map(({ field, calculated }) => [field.name, calculated])).toEqual([['id', true]]);
  });

  it('never returns an excluded node', () => {
    // /ds/operationstdf is excluded in the profile and is a child of /ds
    expect(index.field('/ds/operationstdf')?.coverage).toBe('excluded');
    expect(ids(index.fieldsOf('/ds').blocks)).not.toContain('/ds/operationstdf');
    expect(index.fieldsOf('/ds/operationstdf')).toEqual({ blocks: [], fields: [], attributes: [] });
  });

  it('is empty for an unknown or scalar id', () => {
    expect(index.fieldsOf('/ds/unknown')).toEqual({ blocks: [], fields: [], attributes: [] });
    expect(index.fieldsOf('/ds/organisme/adresse/pays')).toEqual({ blocks: [], fields: [], attributes: [] });
  });
});

describe('attributesOf', () => {
  it('returns the attributes of the simple content of a scalar field', () => {
    const attributes = index.attributesOf('/ds/organisme/adresse/pays');
    expect(ids(attributes)).toEqual(['/ds/organisme/adresse/pays/@type']);
    expect(attributes[0]?.calculated).toBe(false);
  });

  it('is empty for a field without attributes, a block or an unknown id', () => {
    expect(index.attributesOf('/ds/organisme/adresse/ville')).toEqual([]);
    expect(index.attributesOf('/ds/organisme/adresse')).toEqual([]);
    expect(index.attributesOf('/ds/unknown')).toEqual([]);
  });
});

describe('ownerBlockOf', () => {
  it('is the parent block of a scalar field', () => {
    expect(index.ownerBlockOf('/ds/organisme/adresse/ville')).toBe('/ds/organisme/adresse');
  });

  it('climbs from the attribute of a scalar to the enclosing block', () => {
    expect(index.field('/ds/organisme/adresse/pays/@type')?.parent).toBe('/ds/organisme/adresse/pays');
    expect(index.ownerBlockOf('/ds/organisme/adresse/pays/@type')).toBe('/ds/organisme/adresse');
  });

  it('is the block itself for the attribute of a block', () => {
    const card = '/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire';
    expect(index.ownerBlockOf(`${card}/@numeroCarteBancaire`)).toBe(card);
  });

  it('is the enclosing block for a child block', () => {
    expect(index.ownerBlockOf('/ds/organisme/adresse')).toBe('/ds/organisme');
  });

  it('is null for the root and for an unknown id', () => {
    expect(index.ownerBlockOf('/ds')).toBeNull();
    expect(index.ownerBlockOf('/ds/unknown')).toBeNull();
  });
});

describe('codesFor', () => {
  it('returns the codes of the referenced list', () => {
    expect(index.codesFor('/ds/organisme/adresse/pays')).toEqual([
      { value: 'FR', label: 'France' },
      { value: 'AF', label: 'Afghanistan' },
      { value: 'ZA', label: 'Afrique du Sud' },
      { value: 'AX', label: 'Åland, Îles' },
    ]);
  });

  it('removes the excluded codes of the list', () => {
    const csv = catalogProfileFixture.codes['typesdedocuments.csv'];
    expect(csv?.map((code) => code.value)).toContain('TA17');
    expect(catalogProfileFixture.excluded_codes['typesdedocuments.csv']).toEqual(['TA17']);

    const options = index.codesFor('/ds/pieceJointe/piece/type');
    if (!Array.isArray(options)) throw new Error('expected a list of codes');
    expect(options.map((code) => code.value)).not.toContain('TA17');
    expect(options.map((code) => code.value)).toEqual(['TA1', 'TA2', 'TA9']);
  });

  it('uses the enumeration constraints when the field has no code list', () => {
    expect(index.field('/ds/organisme/adresse/pays/@type')?.catalogs).toEqual([]);
    expect(index.codesFor('/ds/organisme/adresse/pays/@type')).toEqual([
      { value: 'code', label: 'code' },
      { value: 'other', label: 'other' },
    ]);
  });

  it('merges several lists without repeating a code', () => {
    expect(index.field('/ds/operations/operation/paysOrigineFonds')?.catalogs).toEqual(['dromcom.csv', 'pays.csv']);
    const options = index.codesFor('/ds/operations/operation/paysOrigineFonds');
    if (!Array.isArray(options)) throw new Error('expected a list of codes');
    const values = options.map((code) => code.value);
    expect(new Set(values).size).toBe(values.length);
    expect(values).toEqual(
      expect.arrayContaining(['FR', ...(catalogProfileFixture.codes['dromcom.csv'] ?? []).map((c) => c.value)]),
    );
  });

  it('is unavailable when a referenced list is not shipped in the catalog', () => {
    expect(index.field('/ds/pieceJointe/piece/type_mime')?.catalogs).toEqual(['liste_ref_typemime.csv']);
    expect(catalogProfileFixture.codes).not.toHaveProperty('liste_ref_typemime.csv');
    expect(index.codesFor('/ds/pieceJointe/piece/type_mime')).toBe('unavailable');
  });

  it('is unavailable as soon as one of several referenced lists is missing', () => {
    const { 'dromcom.csv': _removed, ...codes } = catalogProfileFixture.codes;
    const partial = createTracfinCatalogIndex({ ...catalogProfileFixture, hash: 'partial', codes });
    expect(partial.codesFor('/ds/operations/operation/paysOrigineFonds')).toBe('unavailable');
  });

  it('is null for a field with neither a list nor an enumeration, and for an unknown id', () => {
    expect(index.codesFor('/ds/organisme/adresse/ville')).toBeNull();
    expect(index.codesFor('/ds/unknown')).toBeNull();
    expect(index.codesFor('constructor')).toBeNull();
  });
});

describe('cardinality', () => {
  it('reads minimum and maximum', () => {
    expect(index.cardinality('/ds/organisme/adresse/ville')).toEqual({ min: 1, max: 1 });
    expect(index.cardinality('/ds/organisme/adresse/pays/@type')).toEqual({ min: 0, max: 1 });
    expect(index.cardinality('/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire')).toEqual({
      min: 0,
      max: 20,
    });
  });

  it('reads the cardinality of a choice group', () => {
    expect(index.cardinality('/ds/personnes/pm/dirigeant#identity')).toEqual({ min: 0, max: 1 });
  });

  it('turns unbounded into a null maximum', () => {
    const field = index.field('/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire');
    if (!field) throw new Error('fixture field missing');
    const unbounded: TracfinProfile = {
      ...catalogProfileFixture,
      hash: 'unbounded',
      fields: { ...catalogProfileFixture.fields, [field.id]: { ...field, max: 'unbounded' } },
    };
    expect(createTracfinCatalogIndex(unbounded).cardinality(field.id)).toEqual({ min: 0, max: null });
  });

  it('is null for an unknown id', () => {
    expect(index.cardinality('/ds/unknown')).toBeNull();
    expect(index.cardinality('constructor')).toBeNull();
  });

  describe('a malformed bound', () => {
    const pieceId = '/ds/pieceJointe/piece';
    const piece = catalogProfileFixture.fields[pieceId];
    if (!piece) throw new Error('fixture field missing');
    const withBounds = (bounds: { min?: string; max?: string }): TracfinProfile => ({
      ...catalogProfileFixture,
      hash: 'malformed',
      fields: { ...catalogProfileFixture.fields, [pieceId]: { ...piece, ...bounds } },
    });

    it.each([
      ['a non numeric maximum', { max: 'many' }],
      ['an empty maximum', { max: '' }],
      ['a negative maximum', { max: '-1' }],
      ['a decimal maximum', { max: '1.5' }],
      ['unbounded with another case', { max: 'Unbounded' }],
      ['an unparsable minimum', { min: 'one' }],
      ['an empty minimum', { min: '' }],
      ['an unbounded minimum', { min: 'unbounded' }],
    ])('is refused when the catalog has %s, and the message names the field', (_label, bounds) => {
      expect(() => createTracfinCatalogIndex(withBounds(bounds))).toThrow(
        /Invalid TRACFIN catalog cardinality for \/ds\/pieceJointe\/piece/,
      );
    });

    it('is refused on a choice group too', () => {
      const choice = catalogProfileFixture.choices[0];
      if (!choice) throw new Error('fixture choice missing');
      const profile: TracfinProfile = {
        ...catalogProfileFixture,
        hash: 'malformed-choice',
        choices: [{ ...choice, max: 'x' }],
      };
      expect(() => createTracfinCatalogIndex(profile)).toThrow(
        /Invalid TRACFIN catalog cardinality for \/ds\/personnes\/pm\/dirigeant#identity/,
      );
    });

    it('does not take a malformed bound for "unbounded" or for 0', () => {
      expect(createTracfinCatalogIndex(withBounds({ max: 'unbounded' })).cardinality(pieceId)).toEqual({
        min: 1,
        max: null,
      });
      expect(createTracfinCatalogIndex(withBounds({ min: '0', max: '0' })).cardinality(pieceId)).toEqual({
        min: 0,
        max: 0,
      });
    });
  });
});

describe('choiceGroups', () => {
  it('lists the alternatives of a block with their members, in catalog order', () => {
    const groups = index.choiceGroups('/ds/personnes/pm/dirigeant');
    expect(groups).toHaveLength(1);
    expect(groups[0]?.id).toBe('/ds/personnes/pm/dirigeant#identity');
    expect(groups[0]?.cardinality).toEqual({ min: 0, max: 1 });
    expect(ids(groups[0]?.members ?? [])).toEqual([
      '/ds/personnes/pm/dirigeant/idPersonne',
      '/ds/personnes/pm/dirigeant/autreDirigeantP',
      '/ds/personnes/pm/dirigeant/autreDirigeantM',
    ]);
  });

  it('does not put fields outside the group among its members', () => {
    const members = ids(index.choiceGroups('/ds/personnes/pm/dirigeant')[0]?.members ?? []);
    expect(members).not.toContain('/ds/personnes/pm/dirigeant/fonctionDirigeant');
  });

  it('is empty for a block without alternatives', () => {
    expect(index.choiceGroups('/ds/organisme/adresse')).toEqual([]);
  });
});

describe('getTracfinCatalogIndex', () => {
  it('builds the index once per profile hash', () => {
    const first = getTracfinCatalogIndex(catalogProfileFixture);
    const again = getTracfinCatalogIndex({ ...catalogProfileFixture });
    expect(again).toBe(first);
  });

  it('builds another index when the hash changes', () => {
    const other = getTracfinCatalogIndex({ ...catalogProfileFixture, hash: 'another-profile-hash' });
    expect(other).not.toBe(getTracfinCatalogIndex(catalogProfileFixture));
  });
});
