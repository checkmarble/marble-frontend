import { describe, expect, it } from 'vitest';
import { blockAddress } from '../model/block-address';
import { draftWithout } from '../test-utils/draft-test-data';
import { personsDraft, personsTestIndex } from '../test-utils/persons-test-data';
import { planAddPerson } from './add-person';

describe('planAddPerson', () => {
  it('adds a natural person from a user record with the selection on its civil status, in one list of changes', () => {
    const draft = personsDraft();
    const plan = planAddPerson({
      draft,
      catalogIndex: personsTestIndex,
      kind: 'pp',
      root: { table: 'users', recordId: 'user_9' },
    });
    expect(plan.selection).toEqual({ blockCatalogId: '/ds/personnes/pp/etatCivil', mappingId: 'map-user-last-name' });
    expect(plan.ops).toEqual([
      expect.objectContaining({ type: 'add_block', catalogId: '/ds/personnes/pp', ref: 'person' }),
      expect.objectContaining({ type: 'add_block', catalogId: '/ds/personnes/pp/etatCivil', ref: 'identity' }),
      {
        type: 'set_selection',
        block: { kind: 'ref', ref: 'identity' },
        selection: { mapping_id: 'map-user-last-name', root: { id: 'root', table: 'users', record_id: 'user_9' } },
      },
    ]);
  });

  it('adds a legal entity from a company with the selection on the block that owns the mapped identity fields', () => {
    const plan = planAddPerson({
      draft: personsDraft(),
      catalogIndex: personsTestIndex,
      kind: 'pm',
      root: { table: 'companies', recordId: 'company_302' },
    });
    expect(plan.selection).toEqual({
      blockCatalogId: '/ds/personnes/pm/activiteCoordonnee',
      mappingId: 'map-company-name',
    });
  });

  it('adds the person alone when no mapping starts from the table of the root', () => {
    const plan = planAddPerson({
      draft: personsDraft(),
      catalogIndex: personsTestIndex,
      kind: 'pm',
      root: { table: 'users', recordId: 'user_9' },
    });
    expect(plan.selection).toBeNull();
    expect(plan.ops).toHaveLength(1);
  });

  it('adds a person by hand with no selection, whatever the kind', () => {
    for (const kind of ['pp', 'pm', 'pnc'] as const) {
      const plan = planAddPerson({ draft: personsDraft(), catalogIndex: personsTestIndex, kind });
      expect(plan.selection).toBeNull();
      expect(plan.ops).toEqual([
        expect.objectContaining({ type: 'add_block', catalogId: `/ds/personnes/${kind}`, ref: 'person' }),
      ]);
    }
  });

  it('never looks for a mapping for a non-customer person', () => {
    const plan = planAddPerson({
      draft: personsDraft(),
      catalogIndex: personsTestIndex,
      kind: 'pnc',
      root: { table: 'users', recordId: 'user_9' },
    });
    expect(plan.selection).toBeNull();
  });

  it('puts the person under the existing /ds/personnes, or under the one to create', () => {
    const existing = planAddPerson({ draft: personsDraft(), catalogIndex: personsTestIndex, kind: 'pp' });
    expect(existing.ops[0]).toMatchObject({ parent: blockAddress(expect.any(String)) });
    const absent = planAddPerson({ draft: draftWithout('/ds/personnes'), catalogIndex: personsTestIndex, kind: 'pp' });
    expect(absent.ops[0]).toMatchObject({ parent: { kind: 'virtual', path: ['/ds/personnes'] } });
  });
});
