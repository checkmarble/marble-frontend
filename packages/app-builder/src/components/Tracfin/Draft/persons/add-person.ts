import type { TracfinDraft, TracfinMapping } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { blockRef, type StructuralOp } from '../model/build-patch';
import { topLevelAddress } from '../sections/section-addresses';
import { identityBlockIds, PERSONS_CATALOG_ID, type PersonKind, personCatalogId } from './person-kinds';
import { draftMappings, mappingsOwnedBy, rootStep } from './selection-model';

export type AddPersonPlan = {
  ops: StructuralOp[];
  /** The block that carries the selection, and the mapping it names; `null` for a manual add or when no mapping fits. */
  selection: { blockCatalogId: string; mappingId: string } | null;
};

/** Parts of the person that start a selection when a context root is chosen. Natural persons and legal entities only. */
function identityCandidates(kind: PersonKind): readonly string[] {
  return kind === 'pp' || kind === 'pm' ? identityBlockIds[kind] : [];
}

/** The first identity block of the person that a mapping of the draft configuration can fill from a record of this table. */
export function findIdentityMapping({
  kind,
  table,
  mappings,
  catalogIndex,
}: {
  kind: PersonKind;
  table: string;
  mappings: readonly TracfinMapping[];
  catalogIndex: TracfinCatalogIndex;
}): { blockCatalogId: string; mappingId: string } | null {
  const candidates = [...identityCandidates(kind)];
  if (kind === 'pm') {
    // « The block owning the mapped identity fields »: any other block of the entity that a mapping fills.
    const prefix = `${personCatalogId(kind)}/`;
    const skipped = /\/(lienAutre\w+|referencesFinancieres|dirigeant|infosFinancieresFiscales)(\/|$)/;
    for (const mapping of mappings) {
      const owner = catalogIndex.ownerBlockOf(mapping.target_field);
      if (owner?.startsWith(prefix) && !skipped.test(owner) && !candidates.includes(owner)) candidates.push(owner);
    }
  }
  for (const blockCatalogId of candidates) {
    const mapping = mappingsOwnedBy(mappings, catalogIndex, blockCatalogId).find(
      (candidate) => candidate.source.table === table,
    );
    if (mapping) return { blockCatalogId, mappingId: mapping.id };
  }
  return null;
}

/**
 * The structural changes that declare a person, in one PATCH: the person (and `/ds/personnes` when
 * the draft has none yet) and, for a root of the case, the block that carries the identity with its
 * selection. Without a root, or when no mapping of the draft configuration starts from the table of
 * the root, only the person is added (`selection` is `null` then).
 */
export function planAddPerson({
  draft,
  catalogIndex,
  kind,
  root,
}: {
  draft: TracfinDraft;
  catalogIndex: TracfinCatalogIndex;
  kind: PersonKind;
  root?: { table: string; recordId: string };
}): AddPersonPlan {
  const container = topLevelAddress(draft, PERSONS_CATALOG_ID);
  const ops: StructuralOp[] = [
    { type: 'add_block', parent: container, catalogId: personCatalogId(kind), ref: 'person' },
  ];
  const found = root
    ? findIdentityMapping({ kind, table: root.table, mappings: draftMappings(draft), catalogIndex })
    : null;
  if (root && found) {
    ops.push(
      { type: 'add_block', parent: blockRef('person'), catalogId: found.blockCatalogId, ref: 'identity' },
      {
        type: 'set_selection',
        block: blockRef('identity'),
        selection: { mapping_id: found.mappingId, root: rootStep(root.table, root.recordId) },
      },
    );
  }
  return { ops, selection: found };
}
