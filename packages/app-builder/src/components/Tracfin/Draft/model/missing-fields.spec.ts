import { describe, expect, it } from 'vitest';
import { cloneDraft, draftTestIndex, draftWithout, findByCatalogId } from '../test-utils/draft-test-data';
import { blockAddress } from './block-address';
import { countMissingExpected } from './missing-fields';
import { type EditTarget, PendingIndex, planEdit } from './pending-edits';
import { tracfinSectionScopes } from './sections';

const count = (
  draft = cloneDraft(),
  section: keyof typeof tracfinSectionScopes = 'declaration',
  pending: PendingIndex = new PendingIndex([], draft.document.root),
) => countMissingExpected({ catalogIndex: draftTestIndex, draft, pending, scope: tracfinSectionScopes[section]! });

describe('countMissingExpected', () => {
  it('counts the fields the catalog expects (min >= 1) that hold nothing', () => {
    // Everything of organisme is filled; the declarant's phone is expected and missing. The contact
    // block is optional (min 0) and absent: nothing is expected of it.
    expect(count(cloneDraft())).toBe(1);
  });

  it('treats a block the draft lacks as empty when the catalog expects it', () => {
    // Legal framework, internal reference and « précision » flag (the analysis is filled).
    expect(count(draftWithout('/ds/context'), 'context')).toBe(3);
    expect(count(cloneDraft(), 'context')).toBeLessThan(3);
  });

  it('counts a saved value as filled, an explicit clear as missing, and a pending edit as what it will be', () => {
    const draft = cloneDraft();
    const organisme = findByCatalogId(draft.document.root, '/ds/organisme')!;
    const libelle = organisme.fields!['/ds/organisme/libelle']![0]!;

    const clear: EditTarget = {
      block: blockAddress(organisme.id),
      fieldId: '/ds/organisme/libelle',
      parentValueId: null,
      valueId: libelle.id,
      newKey: null,
    };
    const pendingClear = new PendingIndex(
      [{ ...planEdit({ target: clear, op: { type: 'clear' }, serverValue: libelle })!, uid: 1 }],
      draft.document.root,
    );
    expect(count(draft, 'declaration', pendingClear)).toBe(2);

    const coordonnees = findByCatalogId(draft.document.root, '/ds/declarant/coordonnees')!;
    const tel: EditTarget = {
      block: blockAddress(coordonnees.id),
      fieldId: '/ds/declarant/coordonnees/tel',
      parentValueId: null,
      valueId: null,
      newKey: 'single',
    };
    const pendingFill = new PendingIndex(
      [
        {
          ...planEdit({ target: tel, op: { type: 'set', input: { kind: 'text', text: '0102' } }, serverValue: null })!,
          uid: 1,
        },
      ],
      draft.document.root,
    );
    expect(count(draft, 'declaration', pendingFill)).toBe(0);

    // A cleared value saved on the server is empty too.
    libelle.kind = 'cleared';
    delete libelle.text;
    expect(count(draft)).toBe(2);
  });

  it('counts an expected block that exists with nothing in it (a person without civil status)', () => {
    // The fixture's person has an etatCivil block with no field: nothing in the personnes scope is
    // expected of etatCivil's fields (all optional), but lienAutrePm expects its company name.
    expect(count(cloneDraft(), 'persons')).toBe(1);
  });

  it('has nothing to count for the review section', () => {
    expect(tracfinSectionScopes.review).toBeNull();
  });
});
