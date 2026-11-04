import type { TracfinBlock, TracfinDraft } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { blockAddress, singletonChildAddress, type TracfinBlockAddress, virtualAddress } from './block-address';
import { hasContent, occurrencesOf } from './field-values';
import type { PendingIndex } from './pending-edits';
import type { TracfinSectionScope } from './sections';

/**
 * How many fields the catalog expects (`min >= 1`) and that hold nothing yet, in the blocks of a
 * section. It is only an indication for the analyst: it never blocks saving or exporting.
 *
 * - what is unsaved counts: a pending value fills a field, a pending clear empties it;
 * - an explicitly cleared field is empty;
 * - a missing block is visited when the catalog expects it (`min >= 1`), as if it existed;
 * - the members of a choice are not counted (only one branch is ever wanted).
 */
export function countMissingExpected({
  catalogIndex,
  draft,
  pending,
  scope,
}: {
  catalogIndex: TracfinCatalogIndex;
  draft: TracfinDraft;
  pending: PendingIndex;
  scope: TracfinSectionScope;
}): number {
  const root = draft.document.root;
  const rootAddress = blockAddress(root.id);

  const isFilled = (block: TracfinBlock | null, address: TracfinBlockAddress, fieldId: string) =>
    occurrencesOf({
      block,
      address,
      fieldId,
      pending: pending.forField(address, fieldId, null),
      single: false,
    }).some((occurrence) => hasContent(occurrence.state));

  const visit = (catalogId: string, block: TracfinBlock | null, address: TracfinBlockAddress): number => {
    const contents = catalogIndex.fieldsOf(catalogId);
    const choiceMembers = new Set(
      catalogIndex.choiceGroups(catalogId).flatMap((group) => group.members.map(({ field }) => field.id)),
    );
    let missing = 0;

    for (const { field, calculated } of [...contents.fields, ...contents.attributes]) {
      if (calculated || choiceMembers.has(field.id)) continue;
      if ((catalogIndex.cardinality(field.id)?.min ?? 0) >= 1 && !isFilled(block, address, field.id)) missing++;
    }

    // Attributes of simple content count under an owner that has a value.
    for (const { field: owner, calculated } of contents.fields) {
      if (calculated || choiceMembers.has(owner.id)) continue;
      const attributes = catalogIndex.attributesOf(owner.id).filter((entry) => !entry.calculated);
      if (attributes.length === 0) continue;
      const owners = occurrencesOf({
        block,
        address,
        fieldId: owner.id,
        pending: pending.forField(address, owner.id, null),
        single: false,
      }).filter((occurrence) => occurrence.target.valueId !== null && hasContent(occurrence.state));
      for (const ownerOccurrence of owners) {
        for (const { field: attribute } of attributes) {
          if ((catalogIndex.cardinality(attribute.id)?.min ?? 0) < 1) continue;
          const filled = occurrencesOf({
            block,
            address,
            fieldId: attribute.id,
            parentValueId: ownerOccurrence.target.valueId,
            pending: pending.forField(address, attribute.id, ownerOccurrence.target.valueId),
            single: false,
          }).some((occurrence) => hasContent(occurrence.state));
          if (!filled) missing++;
        }
      }
    }

    for (const { field: child, calculated } of contents.blocks) {
      if (calculated || choiceMembers.has(child.id)) continue;
      const instances = (block?.children ?? []).filter((candidate) => candidate.catalog_id === child.id);
      if (instances.length > 0) {
        for (const instance of instances) missing += visit(child.id, instance, blockAddress(instance.id));
      } else if ((catalogIndex.cardinality(child.id)?.min ?? 0) >= 1) {
        const childAddress =
          address.kind === 'block'
            ? virtualAddress(address.id, [child.id])
            : virtualAddress(address.anchorId, [...address.path, child.id]);
        missing += visit(child.id, null, childAddress);
      }
    }
    return missing;
  };

  let total = 0;
  for (const blockId of scope.blocks) {
    const instances = root.children?.filter((child) => child.catalog_id === blockId) ?? [];
    if (instances.length > 0) {
      for (const instance of instances) total += visit(blockId, instance, blockAddress(instance.id));
    } else if ((catalogIndex.cardinality(blockId)?.min ?? 0) >= 1) {
      total += visit(blockId, null, singletonChildAddress(root, rootAddress, blockId));
    }
  }
  for (const fieldId of scope.rootFields ?? []) {
    if ((catalogIndex.cardinality(fieldId)?.min ?? 0) >= 1 && !isFilled(root, rootAddress, fieldId)) total++;
  }
  return total;
}
