import { describe, expect, it } from 'vitest';
import { block, personsTestIndex, reference, text } from '../test-utils/persons-test-data';
import { planInvertRelation, relationTargetId } from './invert-relation';

const LINK = '/ds/personnes/pp/lienAutrePersonneDejaDeclaree';

function documentWith(link = linkBlock('pm-1')) {
  const owner = block('/ds/personnes/pp', { children: [link] }, 'pp-1');
  const target = block('/ds/personnes/pm', {}, 'pm-1');
  return block('/ds', { children: [block('/ds/personnes', { children: [owner, target] })] });
}

function linkBlock(targetId: string) {
  return block(
    LINK,
    {
      fields: {
        [`${LINK}/idPersonne`]: [reference('r', targetId)],
        [`${LINK}/precisionRelation`]: [text('p', 'collègues')],
        [`${LINK}/certitude`]: [{ id: 'c', kind: 'boolean', boolean: true }],
        [`${LINK}/precisions`]: [{ id: 'x', kind: 'cleared' }],
      },
      children: [
        block(`${LINK}/typeRelation`, {
          fields: { [`${LINK}/typeRelation/categorieRelation`]: [text('t', 'TLP54')] },
        }),
      ],
    },
    'link-1',
  );
}

describe('relationTargetId', () => {
  it('reads the person a link points to', () => {
    expect(relationTargetId(linkBlock('pm-1'))).toBe('pm-1');
    expect(relationTargetId(block(LINK))).toBeNull();
  });
});

describe('planInvertRelation', () => {
  it('removes the link, recreates it on the target with the owner as idPersonne, and copies what describes it', () => {
    const plan = planInvertRelation({
      root: documentWith(),
      ownerId: 'pp-1',
      linkId: 'link-1',
      catalogIndex: personsTestIndex,
    });
    if (!plan.ok) throw new Error('expected a plan');
    expect(plan.targetPersonId).toBe('pm-1');
    expect(plan.ops).toEqual([
      { type: 'remove_block', blockId: 'link-1' },
      {
        type: 'add_block',
        parent: { kind: 'block', id: 'pm-1' },
        catalogId: '/ds/personnes/pm/lienAutrePersonneDejaDeclaree',
        ref: 'link',
      },
      {
        type: 'set_field',
        block: { kind: 'ref', ref: 'link' },
        fieldId: '/ds/personnes/pm/lienAutrePersonneDejaDeclaree/precisionRelation',
        input: { kind: 'text', text: 'collègues' },
      },
      {
        type: 'set_field',
        block: { kind: 'ref', ref: 'link' },
        fieldId: '/ds/personnes/pm/lienAutrePersonneDejaDeclaree/certitude',
        input: { kind: 'boolean', boolean: true },
      },
      {
        type: 'add_block',
        parent: { kind: 'ref', ref: 'link' },
        catalogId: '/ds/personnes/pm/lienAutrePersonneDejaDeclaree/typeRelation',
        ref: 'link-child-0',
      },
      {
        type: 'set_field',
        block: { kind: 'ref', ref: 'link-child-0' },
        fieldId: '/ds/personnes/pm/lienAutrePersonneDejaDeclaree/typeRelation/categorieRelation',
        input: { kind: 'text', text: 'TLP54' },
      },
      {
        type: 'set_relation',
        block: { kind: 'ref', ref: 'link' },
        fieldId: '/ds/personnes/pm/lienAutrePersonneDejaDeclaree/idPersonne',
        relation: { block_id: 'pp-1' },
      },
    ]);
  });

  it('refuses a link with no target, a target that is gone, and the owner itself', () => {
    const noTarget = planInvertRelation({
      root: documentWith(block(LINK, {}, 'link-1')),
      ownerId: 'pp-1',
      linkId: 'link-1',
      catalogIndex: personsTestIndex,
    });
    expect(noTarget).toEqual({ ok: false, reason: 'no_target' });
    const gone = planInvertRelation({
      root: documentWith(linkBlock('missing')),
      ownerId: 'pp-1',
      linkId: 'link-1',
      catalogIndex: personsTestIndex,
    });
    expect(gone).toEqual({ ok: false, reason: 'target_missing' });
    const self = planInvertRelation({
      root: documentWith(linkBlock('pp-1')),
      ownerId: 'pp-1',
      linkId: 'link-1',
      catalogIndex: personsTestIndex,
    });
    expect(self).toEqual({ ok: false, reason: 'self' });
  });

  it('refuses when the target already holds the maximum number of links', () => {
    const owner = block('/ds/personnes/pp', { children: [linkBlock('pm-1')] }, 'pp-1');
    const full = block(
      '/ds/personnes/pm',
      { children: Array.from({ length: 10 }, () => block('/ds/personnes/pm/lienAutrePersonneDejaDeclaree')) },
      'pm-1',
    );
    const root = block('/ds', { children: [block('/ds/personnes', { children: [owner, full] })] });
    expect(planInvertRelation({ root, ownerId: 'pp-1', linkId: 'link-1', catalogIndex: personsTestIndex })).toEqual({
      ok: false,
      reason: 'target_full',
    });
  });
});
