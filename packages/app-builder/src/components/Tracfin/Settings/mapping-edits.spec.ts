import type { TracfinMapping } from '@app-builder/models/tracfin';
import { tracfinDataModelFixture } from '@app-builder/models/tracfin/__fixtures__';
import { catalogProfileFixture } from '@app-builder/models/tracfin/__fixtures__/catalog.fixture';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { describe, expect, it } from 'vitest';
import {
  addCode,
  createMapping,
  duplicateMapping,
  generateMappingId,
  getCurrencyEvidenceMode,
  listRootTables,
  removeCode,
  removePathFrom,
  setCurrencyEvidenceMode,
  setCurrencyEvidenceValue,
  setEntityType,
  setPathHop,
  setRootTable,
  setSourceKind,
  setTargetField,
  setUnitOperation,
  supportsUnitOperation,
  updateCode,
} from './mapping-edits';

const catalogIndex = getTracfinCatalogIndex(catalogProfileFixture);
const dataModel = tracfinDataModelFixture;

const GENDER = '/ds/personnes/pp/etatCivil/sexe';
const FIRST_NAME = '/ds/personnes/pp/etatCivil/prenom';
const AMOUNT = '/ds/operations/operation/montantTotal';
const AMOUNT_EUR = '/ds/operations/operationEnCours/montantEuro';
const COUNT = '/ds/operations/operation/nombreOperations';

const mapping = (overrides: Partial<TracfinMapping> = {}): TracfinMapping => ({
  id: 'm1',
  target_field: FIRST_NAME,
  source: { kind: 'ingested', entity_type: 'Person', table: 'users', field: 'first_name' },
  ...overrides,
});

describe('generateMappingId', () => {
  it('slugs the end of the target path and adds a random suffix', () => {
    expect(generateMappingId(FIRST_NAME, [], () => 'ab12')).toBe('etatcivil-prenom-ab12');
    expect(generateMappingId('/ds/personnes/pp/referencesFinancieres/x/@numeroCarteBancaire', [], () => 'ab12')).toBe(
      'x-numerocartebancaire-ab12',
    );
  });

  it('draws again until the id is unique', () => {
    const draws = ['aaaa', 'aaaa', 'bbbb'];
    expect(generateMappingId(FIRST_NAME, ['etatcivil-prenom-aaaa'], () => draws.shift() ?? 'zzzz')).toBe(
      'etatcivil-prenom-bbbb',
    );
  });

  it('is stable in shape with the default random source', () => {
    expect(generateMappingId(FIRST_NAME, [])).toMatch(/^etatcivil-prenom-[a-z0-9]{4}$/);
  });
});

describe('createMapping', () => {
  it('starts as an ingested Person mapping with a generated id', () => {
    expect(createMapping({ targetField: FIRST_NAME, existingIds: [], catalogIndex, random: () => 'r4nd' })).toEqual({
      id: 'etatcivil-prenom-r4nd',
      target_field: FIRST_NAME,
      source: { kind: 'ingested', entity_type: 'Person' },
    });
  });

  it('takes the currency the profile proves for the target', () => {
    expect(createMapping({ targetField: AMOUNT_EUR, existingIds: [], catalogIndex }).target_currency).toBe('EUR');
    expect(createMapping({ targetField: AMOUNT, existingIds: [], catalogIndex }).target_currency).toBeUndefined();
  });
});

describe('duplicateMapping', () => {
  it('copies the mapping under a new id and keeps the ids of its path steps', () => {
    const original = mapping({
      codes: [{ source: 'a', target: 'b' }],
      source: {
        kind: 'ingested',
        entity_type: 'Person',
        table: 'users',
        field: 'number',
        path: [{ id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' }],
      },
    });
    const copy = duplicateMapping(original, ['m1'], () => 'c0py');

    expect(copy.id).toBe('etatcivil-prenom-c0py');
    expect({ ...copy, id: 'm1' }).toEqual(original);
    expect(copy.codes).not.toBe(original.codes);
  });
});

describe('setTargetField', () => {
  it('keeps the code correspondences only while the target has the same code list', () => {
    const withCodes = mapping({ target_field: GENDER, codes: [{ source: 'M', target: 'SEX1' }] });
    expect(setTargetField(withCodes, GENDER, catalogIndex).codes).toEqual([{ source: 'M', target: 'SEX1' }]);
    expect(setTargetField(withCodes, '/ds/organisme/adresse/pays', catalogIndex).codes).toBeUndefined();
    expect(setTargetField(withCodes, FIRST_NAME, catalogIndex).codes).toBeUndefined();
  });

  it('drops amount members and the unit-operation flag when the target no longer takes them', () => {
    const amount = mapping({
      target_field: AMOUNT,
      unit: 'minor',
      target_currency: 'EUR',
      currency: { constant: 'EUR' },
    });
    expect(setTargetField(amount, AMOUNT, catalogIndex)).toEqual(amount);

    const asText = setTargetField(amount, FIRST_NAME, catalogIndex);
    expect(asText).not.toHaveProperty('unit');
    expect(asText).not.toHaveProperty('target_currency');
    expect(asText).not.toHaveProperty('currency');

    const snapshot = mapping({
      target_field: COUNT,
      source: { kind: 'decision_snapshot', historical_type: 'transactions', field: 'x', unit_operation: true },
    });
    expect(setTargetField(snapshot, COUNT, catalogIndex).source.unit_operation).toBe(true);
    expect(setTargetField(snapshot, FIRST_NAME, catalogIndex).source).not.toHaveProperty('unit_operation');
  });

  it('pins the target currency the profile proves', () => {
    expect(setTargetField(mapping({ target_field: FIRST_NAME }), AMOUNT_EUR, catalogIndex).target_currency).toBe('EUR');
  });
});

describe('unit operation', () => {
  it('is offered for the principal operation count only', () => {
    expect(supportsUnitOperation(COUNT)).toBe(true);
    expect(supportsUnitOperation(AMOUNT)).toBe(false);
  });

  it('is set as true or removed, never stored as false', () => {
    const snapshot = mapping({ source: { kind: 'decision_snapshot', historical_type: 't', field: 'f' } });
    expect(setUnitOperation(snapshot, true).source.unit_operation).toBe(true);
    expect(setUnitOperation(setUnitOperation(snapshot, true), false).source).not.toHaveProperty('unit_operation');
  });
});

describe('source edits', () => {
  it('switching the source kind starts a clean source', () => {
    expect(setSourceKind(mapping(), 'decision_snapshot').source).toEqual({ kind: 'decision_snapshot' });
    expect(setSourceKind(mapping({ source: { kind: 'decision_snapshot' } }), 'ingested').source).toEqual({
      kind: 'ingested',
      entity_type: 'Person',
    });
    const unchanged = mapping();
    expect(setSourceKind(unchanged, 'ingested')).toBe(unchanged);
  });

  it('offers person roots for Person and company roots for Company, never partners', () => {
    expect(listRootTables(dataModel, 'Person')).toEqual(['users']);
    expect(listRootTables(dataModel, 'Company')).toEqual(['companies']);
  });

  it('changing the entity type drops a root table that no longer fits, with its path and field', () => {
    const withPath = mapping({
      source: {
        kind: 'ingested',
        entity_type: 'Person',
        table: 'users',
        field: 'f',
        path: [{ id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' }],
      },
    });
    expect(setEntityType(withPath, 'Company', dataModel).source).toEqual({ kind: 'ingested', entity_type: 'Company' });
    expect(setEntityType(withPath, 'Person', dataModel).source).toEqual(withPath.source);
  });

  it('changing the root table starts a new path', () => {
    const withPath = mapping({
      source: {
        kind: 'ingested',
        entity_type: 'Person',
        table: 'users',
        field: 'f',
        path: [{ id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' }],
      },
    });
    expect(setRootTable(withPath, 'other').source).toEqual({ kind: 'ingested', entity_type: 'Person', table: 'other' });
  });
});

describe('setPathHop', () => {
  const accounts = { link: 'user', direction: 'inverse' as const, table: 'accounts' };
  const cards = { link: 'account', direction: 'inverse' as const, table: 'cards' };
  const start = mapping({ source: { kind: 'ingested', entity_type: 'Person', table: 'users', field: 'first_name' } });

  it('builds a User -> Account -> Card path and clears the field of the table it left', () => {
    const one = setPathHop({ mappings: [start], mappingId: 'm1', index: 0, hop: accounts });
    expect(one[0]?.source.path).toEqual([
      { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' },
    ]);
    expect(one[0]?.source).not.toHaveProperty('field');

    const two = setPathHop({ mappings: one, mappingId: 'm1', index: 1, hop: cards });
    expect(two[0]?.source.path).toEqual([
      { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' },
      { id: 'cards', parent_id: 'accounts', link: 'account', direction: 'inverse', table: 'cards' },
    ]);
  });

  it('drops the steps after the one that is changed', () => {
    const long = mapping({
      source: {
        kind: 'ingested',
        entity_type: 'Person',
        table: 'users',
        path: [
          { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' },
          { id: 'cards', parent_id: 'accounts', link: 'account', direction: 'inverse', table: 'cards' },
        ],
      },
    });
    const changed = setPathHop({
      mappings: [long],
      mappingId: 'm1',
      index: 0,
      hop: { link: 'employer', direction: 'forward', table: 'companies' },
    });
    expect(changed[0]?.source.path).toEqual([
      { id: 'companies', parent_id: 'root', link: 'employer', direction: 'forward', table: 'companies' },
    ]);
  });

  it('keeps the field while the path ends on the same table', () => {
    const base = mapping({
      source: {
        kind: 'ingested',
        entity_type: 'Person',
        table: 'users',
        field: 'number',
        path: [{ id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' }],
      },
    });
    const same = setPathHop({ mappings: [base], mappingId: 'm1', index: 0, hop: accounts });
    expect(same[0]?.source.field).toBe('number');
  });

  it('removing steps removes them and what follows, and the field of the table that is left', () => {
    const long = mapping({
      source: {
        kind: 'ingested',
        entity_type: 'Person',
        table: 'users',
        field: 'number',
        path: [
          { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' },
          { id: 'cards', parent_id: 'accounts', link: 'account', direction: 'inverse', table: 'cards' },
        ],
      },
    });
    const shorter = removePathFrom(long, 1);
    expect(shorter.source.path).toHaveLength(1);
    expect(shorter.source).not.toHaveProperty('field');
    expect(removePathFrom(long, 0).source).not.toHaveProperty('path');
  });

  it('refuses a 21st step', () => {
    const path = Array.from({ length: 20 }, (_, i) => ({
      id: `s${i}`,
      parent_id: i === 0 ? 'root' : `s${i - 1}`,
      link: 'l',
      direction: 'forward' as const,
      table: 't',
    }));
    const full = mapping({ source: { kind: 'ingested', entity_type: 'Person', table: 'users', path } });
    expect(setPathHop({ mappings: [full], mappingId: 'm1', index: 20, hop: accounts })).toEqual([full]);
  });
});

describe('code correspondences', () => {
  it('adds a blank row, edits it and removes the member with the last row', () => {
    const added = addCode(mapping());
    expect(added.codes).toEqual([{ source: '', target: '' }]);
    const edited = updateCode(updateCode(added, 0, { source: 'M' }), 0, { target: 'SEX1' });
    expect(edited.codes).toEqual([{ source: 'M', target: 'SEX1' }]);
    expect(removeCode(edited, 0)).not.toHaveProperty('codes');
  });
});

describe('currency evidence', () => {
  it('is exactly one of a source field or a constant', () => {
    const amount = mapping({ target_field: AMOUNT, unit: 'minor', target_currency: 'EUR' });
    expect(getCurrencyEvidenceMode(amount)).toBeNull();

    const constant = setCurrencyEvidenceMode(amount, 'constant');
    expect(constant.currency).toEqual({ constant: 'EUR' });
    expect(getCurrencyEvidenceMode(constant)).toBe('constant');

    const field = setCurrencyEvidenceValue(setCurrencyEvidenceMode(constant, 'field'), 'currency');
    expect(field.currency).toEqual({ field: 'currency' });
    expect(getCurrencyEvidenceMode(field)).toBe('field');
  });
});
