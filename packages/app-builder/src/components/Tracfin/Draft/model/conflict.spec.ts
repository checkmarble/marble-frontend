import { describe, expect, it } from 'vitest';
import { cloneDraft, findByCatalogId } from '../test-utils/draft-test-data';
import { blockAddress } from './block-address';
import { compareWithServer } from './conflict';
import { type EditTarget, type PendingEdit, planEdit } from './pending-edits';

const draft = cloneDraft();
const organisme = findByCatalogId(draft.document.root, '/ds/organisme')!;
const libelle = organisme.fields!['/ds/organisme/libelle']![0]!;

function edit(overrides: Partial<EditTarget>, op: Parameters<typeof planEdit>[0]['op']): PendingEdit {
  const target: EditTarget = {
    block: blockAddress(organisme.id),
    fieldId: '/ds/organisme/libelle',
    parentValueId: null,
    valueId: libelle.id,
    newKey: null,
    ...overrides,
  };
  return { ...planEdit({ target, op, serverValue: null })!, uid: 1 };
}

describe('compareWithServer', () => {
  it('shows the server value against the local one', () => {
    const [item] = compareWithServer(draft, [edit({}, { type: 'set', input: { kind: 'text', text: 'Autre' } })]);
    expect(item).toMatchObject({
      status: 'differs',
      server: { kind: 'text', text: 'Banque Exemple SA' },
      local: { kind: 'text', text: 'Autre' },
    });
  });

  it('recognises an edit the server already holds', () => {
    const [item] = compareWithServer(draft, [
      edit({}, { type: 'set', input: { kind: 'text', text: 'Banque Exemple SA' } }),
    ]);
    expect(item?.status).toBe('identical');
  });

  it('lists an edit whose occurrence, block or owner no longer exists', () => {
    const items = compareWithServer(draft, [
      edit({ valueId: 'gone' }, { type: 'set', input: { kind: 'text', text: 'x' } }),
      edit({ block: blockAddress('gone') }, { type: 'set', input: { kind: 'text', text: 'x' } }),
      edit(
        { valueId: null, newKey: 'k', parentValueId: 'no-owner', fieldId: '/ds/organisme/adresse/pays/@type' },
        { type: 'set', input: { kind: 'text', text: 'code' } },
      ),
    ]);
    expect(items.map((item) => item.status)).toEqual(['orphan', 'orphan', 'orphan']);
  });

  it('compares a new occurrence with what the field holds on the server', () => {
    const [item] = compareWithServer(draft, [
      edit({ valueId: null, newKey: 'k' }, { type: 'set', input: { kind: 'text', text: 'Nouveau' } }),
    ]);
    expect(item).toMatchObject({ status: 'differs', server: { kind: 'text', text: 'Banque Exemple SA' } });
  });
});
