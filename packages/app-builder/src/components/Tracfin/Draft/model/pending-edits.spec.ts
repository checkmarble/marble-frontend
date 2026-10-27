import type { TracfinValue } from '@app-builder/models/tracfin';
import { describe, expect, it } from 'vitest';
import { cloneDraft, findByCatalogId } from '../test-utils/draft-test-data';
import { blockAddress, virtualAddress } from './block-address';
import { type EditTarget, PendingEditStore, PendingIndex, pendingKey, planEdit, sameInput } from './pending-edits';

const block = blockAddress('b1');
const saved: TracfinValue = { id: 'v1', kind: 'text', text: 'abc' };
const existing: EditTarget = { block, fieldId: '/f', parentValueId: null, valueId: 'v1', newKey: null };
const fresh: EditTarget = { block, fieldId: '/f', parentValueId: null, valueId: null, newKey: 'single' };

describe('planEdit', () => {
  it('drops an edit that gives the saved value back', () => {
    expect(
      planEdit({ target: existing, op: { type: 'set', input: { kind: 'text', text: 'abc' } }, serverValue: saved }),
    ).toBeNull();
  });

  it('keeps a changed value, and a « Confirmer » even though it is the same value', () => {
    const changed = planEdit({
      target: existing,
      op: { type: 'set', input: { kind: 'text', text: 'abd' } },
      serverValue: saved,
    });
    expect(changed?.op).toEqual({ type: 'set', input: { kind: 'text', text: 'abd' } });
    const confirm = planEdit({
      target: existing,
      op: { type: 'set', input: { kind: 'text', text: 'abc' } },
      serverValue: saved,
      confirm: true,
    });
    expect(confirm?.confirm).toBe(true);
  });

  it('reads an empty text as clearing the occurrence, but only a saved one can be cleared', () => {
    expect(
      planEdit({ target: existing, op: { type: 'set', input: { kind: 'text', text: '' } }, serverValue: saved })?.op,
    ).toEqual({
      type: 'clear',
    });
    expect(
      planEdit({ target: fresh, op: { type: 'set', input: { kind: 'text', text: '' } }, serverValue: null }),
    ).toBeNull();
    expect(
      planEdit({ target: existing, op: { type: 'clear' }, serverValue: { id: 'v1', kind: 'cleared' } }),
    ).toBeNull();
  });

  it('keeps a malformed decimal flagged so that it is never sent', () => {
    const edit = planEdit({
      target: fresh,
      op: { type: 'set', input: { kind: 'decimal', decimal: '1,5' } },
      serverValue: null,
      invalid: true,
    });
    expect(edit?.invalid).toBe(true);
  });

  it('compares references by block and person', () => {
    const value: TracfinValue = { id: 'v', kind: 'reference', reference: { block_id: 'a', person_block_id: 'p' } };
    expect(sameInput(value, { kind: 'reference', reference: { block_id: 'a', person_block_id: 'p' } })).toBe(true);
    expect(sameInput(value, { kind: 'reference', reference: { block_id: 'a' } })).toBe(false);
    expect(sameInput(value, { kind: 'text', text: 'a' })).toBe(false);
  });
});

describe('PendingEditStore', () => {
  const edit = (target: EditTarget, text: string) =>
    planEdit({ target, op: { type: 'set', input: { kind: 'text', text } }, serverValue: null })!;

  it('replaces an earlier edit of the same occurrence and keeps its place and identity', () => {
    const store = new PendingEditStore();
    store.upsert(edit(existing, 'a'));
    store.upsert(edit(fresh, 'b'));
    const [first] = store.list();
    store.upsert(edit(existing, 'aa'));
    expect(store.list().map((entry) => entry.key)).toEqual([pendingKey(existing), pendingKey(fresh)]);
    expect(store.list()[0]?.uid).toBe(first?.uid);
    expect(store.list()[0]?.version).toBe(1);
  });

  it('only counts real edits as unsaved: an open blank slot is not one', () => {
    const store = new PendingEditStore();
    store.upsert(planEdit({ target: { ...fresh, newKey: 'x' }, op: { type: 'blank' }, serverValue: null })!);
    expect(store.hasUnsaved()).toBe(false);
    store.upsert(edit(existing, 'a'));
    expect(store.hasUnsaved()).toBe(true);
  });

  it('notifies subscribers and gives a stable snapshot between changes', () => {
    const store = new PendingEditStore();
    let calls = 0;
    store.subscribe(() => calls++);
    const empty = store.snapshot();
    expect(store.snapshot()).toBe(empty);
    store.upsert(edit(existing, 'a'));
    expect(calls).toBe(1);
    expect(store.snapshot()).not.toBe(empty);
  });

  it('re-addresses a virtual block that now exists, and flags an edit whose anchor is gone', () => {
    const root = cloneDraft().document.root;
    const general = findByCatalogId(root, '/ds/context/general')!;
    const store = new PendingEditStore();
    const virtualTarget: EditTarget = {
      block: virtualAddress(root.id, ['/ds/context', '/ds/context/general']),
      fieldId: '/ds/context/general/refInterne',
      parentValueId: null,
      valueId: null,
      newKey: 'single',
    };
    store.upsert(edit(virtualTarget, 'x'));
    store.upsert(edit({ ...existing, block: blockAddress('gone') }, 'y'));
    store.rebase(root);
    const [rebased, orphan] = store.list();
    expect(rebased?.block).toEqual(blockAddress(general.id));
    expect(rebased?.key).toBe(pendingKey({ ...virtualTarget, block: blockAddress(general.id) }));
    expect(orphan?.orphaned).toBe(true);
  });

  it('indexes the edits by field with blocks addressed as the document has them', () => {
    const root = cloneDraft().document.root;
    const general = findByCatalogId(root, '/ds/context/general')!;
    const virtualTarget: EditTarget = {
      block: virtualAddress(root.id, ['/ds/context', '/ds/context/general']),
      fieldId: '/ds/context/general/refInterne',
      parentValueId: null,
      valueId: null,
      newKey: 'single',
    };
    const index = new PendingIndex([edit(virtualTarget, 'x')], root);
    expect(index.forField(blockAddress(general.id), '/ds/context/general/refInterne', null)).toHaveLength(1);
    expect(index.forField(blockAddress(general.id), '/ds/context/general/precisionSignalement', null)).toHaveLength(0);
  });
});
