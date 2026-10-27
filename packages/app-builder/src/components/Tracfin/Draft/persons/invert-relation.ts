import type { TracfinBlock } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { blockAddress, childrenOfCatalogId, findBlock } from '../model/block-address';
import { blockRef, type StructuralOp } from '../model/build-patch';
import { inputOfValue } from '../model/pending-edits';
import { personKindOf, relationCatalogId } from './person-kinds';

export type InvertRelationPlan =
  | { ok: true; ops: StructuralOp[]; targetPersonId: string }
  | { ok: false; reason: 'no_target' | 'target_missing' | 'self' | 'target_full' };

const ID_FIELD = 'idPersonne';

/** The declared person a `lienAutrePersonneDejaDeclaree` block points to. */
export function relationTargetId(link: TracfinBlock): string | null {
  for (const [fieldId, values] of Object.entries(link.fields ?? {})) {
    if (!fieldId.endsWith(`/${ID_FIELD}`)) continue;
    for (const value of values) if (value.kind === 'reference' && value.reference) return value.reference.block_id;
  }
  return null;
}

/**
 * « Inverser le sens » of a link between two declared people, as one PATCH: the link is removed
 * from the person who declared it and recreated on the person it pointed to, with the first person
 * as `idPersonne`. The relation type, the precisions and the certainty are copied, so that only
 * the direction changes. Nothing else of the document is touched.
 */
export function planInvertRelation({
  root,
  ownerId,
  linkId,
  catalogIndex,
}: {
  root: TracfinBlock;
  ownerId: string;
  linkId: string;
  catalogIndex: TracfinCatalogIndex;
}): InvertRelationPlan {
  const link = findBlock(root, linkId);
  const owner = findBlock(root, ownerId);
  if (!link || !owner) return { ok: false, reason: 'no_target' };
  const targetId = relationTargetId(link);
  if (!targetId) return { ok: false, reason: 'no_target' };
  if (targetId === ownerId) return { ok: false, reason: 'self' };
  const target = findBlock(root, targetId);
  const targetKind = target ? personKindOf(target.catalog_id) : null;
  if (!target || !targetKind) return { ok: false, reason: 'target_missing' };

  const newCatalogId = relationCatalogId(targetKind, 'lienAutrePersonneDejaDeclaree');
  const max = catalogIndex.cardinality(newCatalogId)?.max ?? null;
  if (max !== null && childrenOfCatalogId(target, newCatalogId).length >= max) {
    return { ok: false, reason: 'target_full' };
  }

  const ops: StructuralOp[] = [
    { type: 'remove_block', blockId: link.id },
    { type: 'add_block', parent: blockAddress(target.id), catalogId: newCatalogId, ref: 'link' },
  ];

  const copyFields = (source: TracfinBlock, sourceBase: string, ref: string, targetBase: string) => {
    for (const [fieldId, values] of Object.entries(source.fields ?? {})) {
      if (fieldId.endsWith(`/${ID_FIELD}`)) continue;
      for (const value of values) {
        // Attributes of simple content would need their owner's new id: the relation fields have none.
        if (value.kind === 'cleared' || value.parent_value_id) continue;
        const input = inputOfValue(value);
        if (input)
          ops.push({
            type: 'set_field',
            block: blockRef(ref),
            fieldId: targetBase + fieldId.slice(sourceBase.length),
            input,
          });
      }
    }
  };

  copyFields(link, link.catalog_id, 'link', newCatalogId);
  (link.children ?? []).forEach((child, index) => {
    const childCatalogId = newCatalogId + child.catalog_id.slice(link.catalog_id.length);
    if (!catalogIndex.field(childCatalogId)) return;
    const ref = `link-child-${index}`;
    ops.push({ type: 'add_block', parent: blockRef('link'), catalogId: childCatalogId, ref });
    copyFields(child, child.catalog_id, ref, childCatalogId);
  });

  ops.push({
    type: 'set_relation',
    block: blockRef('link'),
    fieldId: `${newCatalogId}/${ID_FIELD}`,
    relation: { block_id: ownerId },
  });
  return { ok: true, ops, targetPersonId: targetId };
}
