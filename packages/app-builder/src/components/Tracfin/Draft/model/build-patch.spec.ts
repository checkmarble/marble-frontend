import type { TracfinDraft } from '@app-builder/models/tracfin';
import { describe, expect, it } from 'vitest';
import { cloneDraft, draftWithout, findByCatalogId } from '../test-utils/draft-test-data';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { blockAddress, virtualAddress } from './block-address';
import { blockRef, planPatch, reconcilePatch } from './build-patch';
import { type EditTarget, type PendingEdit, planEdit } from './pending-edits';

function set(target: EditTarget, text: string, uid = 1): PendingEdit {
  return { ...planEdit({ target, op: { type: 'set', input: { kind: 'text', text } }, serverValue: null })!, uid };
}

function targetIn(
  draft: TracfinDraft,
  catalogId: string,
  fieldId: string,
  extra: Partial<EditTarget> = {},
): EditTarget {
  return {
    block: blockAddress(findByCatalogId(draft.document.root, catalogId)!.id),
    fieldId,
    parentValueId: null,
    valueId: null,
    newKey: 'single',
    ...extra,
  };
}

describe('planPatch', () => {
  it('sends nothing when nothing is pending', () => {
    expect(planPatch({ draft: cloneDraft(), pending: [] })).toBeNull();
  });

  it('replaces an occurrence in place with its value_id, and appends without one', () => {
    const draft = cloneDraft();
    const libelle = targetIn(draft, '/ds/organisme', '/ds/organisme/libelle', { valueId: 'v-1', newKey: null });
    const fresh = targetIn(draft, '/ds/organisme', '/ds/organisme/profession', { newKey: 'k' });
    const plan = planPatch({ draft, pending: [set(libelle, 'A', 1), set(fresh, 'B', 2)] })!;
    expect(plan.changes[0]?.field).toMatchObject({ field_id: '/ds/organisme/libelle', value_id: 'v-1' });
    expect(plan.changes[1]?.field).not.toHaveProperty('value_id');
    expect(plan.changes[1]?.value).toEqual({ kind: 'text', text: 'B' });
  });

  it('sends clear_field with the value_id and no value', () => {
    const draft = cloneDraft();
    const target = targetIn(draft, '/ds/organisme', '/ds/organisme/libelle', { valueId: 'v-1', newKey: null });
    const clear = { ...planEdit({ target, op: { type: 'clear' }, serverValue: null })!, uid: 1 };
    const plan = planPatch({ draft, pending: [clear] })!;
    expect(plan.changes).toEqual([
      {
        action: 'clear_field',
        field: {
          block_id: target.block.kind === 'block' ? target.block.id : '',
          field_id: '/ds/organisme/libelle',
          value_id: 'v-1',
        },
      },
    ]);
  });

  it('carries the owner of an attribute in the value', () => {
    const draft = cloneDraft();
    const target = targetIn(draft, '/ds/organisme/adresse', '/ds/organisme/adresse/pays/@type', {
      parentValueId: 'owner-1',
    });
    const plan = planPatch({ draft, pending: [set(target, 'code')] })!;
    expect(plan.changes[0]?.value).toEqual({ kind: 'text', text: 'code', parent_value_id: 'owner-1' });
  });

  it('creates each missing level once, with aliases shared by the edits of the same PATCH', () => {
    const draft = draftWithout('/ds/context');
    const root = draft.document.root.id;
    const general = virtualAddress(root, ['/ds/context', '/ds/context/general']);
    const natureSoupcon = virtualAddress(root, ['/ds/context', '/ds/context/natureSoupcon']);
    const plan = planPatch({
      draft,
      pending: [
        set(
          {
            block: general,
            fieldId: '/ds/context/general/refInterne',
            parentValueId: null,
            valueId: null,
            newKey: 'single',
          },
          'R',
          1,
        ),
        set(
          {
            block: natureSoupcon,
            fieldId: '/ds/context/natureSoupcon/cadreLegal',
            parentValueId: null,
            valueId: null,
            newKey: 'single',
          },
          'CL01',
          2,
        ),
      ],
    })!;
    expect(plan.changes.map((change) => change.action)).toEqual([
      'add_block',
      'add_block',
      'set_field',
      'add_block',
      'set_field',
    ]);
    const aliases = plan.changes.filter((change) => change.action === 'add_block').map((change) => change.block_id);
    expect(new Set(aliases).size).toBe(3);
    expect(plan.changes[3]?.parent_block_id).toBe(plan.changes[0]?.block_id); // /ds/context is shared
    expect(plan.changes[4]?.field?.block_id).toBe(plan.changes[3]?.block_id);
  });

  it('puts the structural change after the pending edits, under the alias chain of a virtual parent', () => {
    const draft = draftWithout('/ds/personnes');
    const root = draft.document.root.id;
    const libelle = targetIn(draft, '/ds/organisme', '/ds/organisme/libelle', { valueId: 'v-1', newKey: null });
    const plan = planPatch({
      draft,
      pending: [set(libelle, 'X')],
      structural: [
        { type: 'add_block', parent: virtualAddress(root, ['/ds/personnes']), catalogId: '/ds/personnes/pp' },
      ],
    })!;
    expect(plan.changes.map((change) => change.action)).toEqual(['set_field', 'add_block', 'add_block']);
    expect(plan.changes[2]).toMatchObject({
      catalog_id: '/ds/personnes/pp',
      parent_block_id: plan.changes[1]?.block_id,
    });
  });

  it('leaves out the edits of a block that the same PATCH removes, and unsendable ones', () => {
    const draft = cloneDraft();
    const pp = findByCatalogId(draft.document.root, '/ds/personnes/pp')!;
    const inPerson = set(
      { block: blockAddress(pp.children![0]!.id), fieldId: '/f', parentValueId: null, valueId: null, newKey: 'single' },
      'x',
      1,
    );
    const invalid = { ...set(targetIn(draft, '/ds/organisme', '/ds/organisme/libelle'), '1,5', 2), invalid: true };
    const orphan = { ...set(targetIn(draft, '/ds/organisme', '/ds/organisme/profession'), 'o', 3), orphaned: true };
    const plan = planPatch({
      draft,
      pending: [inPerson, invalid, orphan],
      structural: [{ type: 'remove_block', blockId: pp.id }],
    })!;
    expect(plan.changes).toEqual([{ action: 'remove_block', block_id: pp.id }]);
    expect(plan.sent).toEqual([]);
  });

  it('sends refresh_configuration with no other member', () => {
    const plan = planPatch({ draft: cloneDraft(), pending: [], structural: [{ type: 'refresh_configuration' }] })!;
    expect(plan.changes).toEqual([{ action: 'refresh_configuration' }]);
  });
});

describe('reconcilePatch', () => {
  it('finds the server ids that replaced the aliases and the ids of the new occurrences', () => {
    const draft = draftWithout('/ds/context');
    const root = draft.document.root.id;
    const backend = new FakeDraftBackend(draft);
    const general = virtualAddress(root, ['/ds/context', '/ds/context/general']);
    const edit = set(
      {
        block: general,
        fieldId: '/ds/context/general/refInterne',
        parentValueId: null,
        valueId: null,
        newKey: 'single',
      },
      'R',
    );
    const plan = planPatch({ draft, pending: [edit], structural: [] })!;
    const result = backend.patch({ expected_revision: draft.revision, changes: plan.changes });
    if (!result.ok) throw new Error('unexpected');

    const { blockIds, valueIds } = reconcilePatch({ before: draft, after: result.data, plan });
    const serverGeneral = findByCatalogId(result.data.document.root, '/ds/context/general')!;
    const aliasOfGeneral = plan.added[1]!.alias;
    expect(blockIds.get(aliasOfGeneral)).toBe(serverGeneral.id);
    expect(valueIds.get(edit.key)).toBe(serverGeneral.fields!['/ds/context/general/refInterne']![0]!.id);
  });

  it('pairs several new occurrences of a field with the values the server appended, in order', () => {
    const draft = cloneDraft();
    const backend = new FakeDraftBackend(draft);
    const edits = ['a', 'b'].map((text, index) =>
      set(
        targetIn(draft, '/ds/context/natureSoupcon', '/ds/context/natureSoupcon/cadreLegal', { newKey: `k${index}` }),
        text,
        index + 1,
      ),
    );
    const plan = planPatch({ draft, pending: edits })!;
    const result = backend.patch({ expected_revision: draft.revision, changes: plan.changes });
    if (!result.ok) throw new Error('unexpected');
    const { valueIds } = reconcilePatch({ before: draft, after: result.data, plan });
    const values = findByCatalogId(result.data.document.root, '/ds/context/natureSoupcon')!.fields![
      '/ds/context/natureSoupcon/cadreLegal'
    ]!;
    expect(values.slice(-2).map((value) => value.text)).toEqual(['a', 'b']);
    expect([...valueIds.values()]).toEqual(values.slice(-2).map((value) => value.id));
  });
});

describe('planPatch: several structural changes in one PATCH', () => {
  const selection = { mapping_id: 'map-user-last-name', root: { id: 'root', table: 'users', record_id: 'user_1' } };

  it('lets a change name a block that an earlier add_block of the list creates', () => {
    const draft = draftWithout('/ds/personnes');
    const root = draft.document.root.id;
    const plan = planPatch({
      draft,
      pending: [],
      structural: [
        {
          type: 'add_block',
          parent: virtualAddress(root, ['/ds/personnes']),
          catalogId: '/ds/personnes/pp',
          ref: 'person',
        },
        { type: 'add_block', parent: blockRef('person'), catalogId: '/ds/personnes/pp/etatCivil', ref: 'identity' },
        { type: 'set_selection', block: blockRef('identity'), selection },
      ],
    })!;

    const [personnes, person, identity, setSelection] = plan.changes;
    expect(personnes).toMatchObject({ action: 'add_block', parent_block_id: root, catalog_id: '/ds/personnes' });
    expect(person).toMatchObject({
      action: 'add_block',
      parent_block_id: personnes!.block_id,
      catalog_id: '/ds/personnes/pp',
    });
    expect(identity).toMatchObject({ action: 'add_block', parent_block_id: person!.block_id });
    expect(setSelection).toEqual({ action: 'set_selection', block_id: identity!.block_id, selection });
    expect(plan.added.map((added) => added.catalogId)).toEqual([
      '/ds/personnes',
      '/ds/personnes/pp',
      '/ds/personnes/pp/etatCivil',
    ]);
  });

  it('sends set_field and set_relation on a block created by the same PATCH, with the keys the action needs', () => {
    const draft = cloneDraft();
    const parent = findByCatalogId(draft.document.root, '/ds/personnes/pp')!.id;
    const plan = planPatch({
      draft,
      pending: [],
      structural: [
        { type: 'add_block', parent: blockAddress(parent), catalogId: '/ds/personnes/pp/lienAutrePm', ref: 'link' },
        { type: 'set_field', block: blockRef('link'), fieldId: '/x/a', input: { kind: 'text', text: 'T' } },
        { type: 'set_relation', block: blockRef('link'), fieldId: '/x/id', relation: { block_id: 'owner-1' } },
      ],
    })!;
    const alias = plan.changes[0]!.block_id;
    expect(plan.changes[1]).toEqual({
      action: 'set_field',
      field: { block_id: alias, field_id: '/x/a' },
      value: { kind: 'text', text: 'T' },
    });
    expect(plan.changes[2]).toEqual({
      action: 'set_relation',
      field: { block_id: alias, field_id: '/x/id' },
      relation: { block_id: 'owner-1' },
    });
  });

  it('skips a change that names a ref nothing created, instead of sending a dangling block id', () => {
    const plan = planPatch({
      draft: cloneDraft(),
      pending: [],
      structural: [
        { type: 'set_selection', block: blockRef('nowhere'), selection },
        { type: 'remove_block', blockId: 'x' },
      ],
    })!;
    expect(plan.changes).toEqual([{ action: 'remove_block', block_id: 'x' }]);
  });

  it('keeps the pending field edits first, then the structural changes in the order given', () => {
    const draft = cloneDraft();
    const libelle = targetIn(draft, '/ds/organisme', '/ds/organisme/libelle', { valueId: 'v-1', newKey: null });
    const plan = planPatch({
      draft,
      pending: [set(libelle, 'A')],
      structural: [
        { type: 'remove_block', blockId: 'b-1' },
        {
          type: 'set_selection',
          block: blockAddress(findByCatalogId(draft.document.root, '/ds/organisme')!.id),
          selection,
        },
      ],
    })!;
    expect(plan.changes.map((change) => change.action)).toEqual(['set_field', 'remove_block', 'set_selection']);
  });

  it('is applied by the backend and the aliases are found again in the answer', () => {
    const draft = draftWithout('/ds/personnes');
    const backend = new FakeDraftBackend(draft);
    const plan = planPatch({
      draft,
      pending: [],
      structural: [
        {
          type: 'add_block',
          parent: virtualAddress(draft.document.root.id, ['/ds/personnes']),
          catalogId: '/ds/personnes/pp',
          ref: 'person',
        },
        { type: 'add_block', parent: blockRef('person'), catalogId: '/ds/personnes/pp/etatCivil', ref: 'identity' },
        { type: 'set_selection', block: blockRef('identity'), selection },
      ],
    })!;
    const result = backend.patch({ expected_revision: draft.revision, changes: plan.changes });
    if (!result.ok) throw new Error('unexpected');
    const identity = findByCatalogId(result.data.document.root, '/ds/personnes/pp/etatCivil')!;
    expect(identity.selection).toEqual(selection);
    const { blockIds } = reconcilePatch({ before: draft, after: result.data, plan });
    expect(blockIds.get(plan.added[2]!.alias)).toBe(identity.id);
  });
});
