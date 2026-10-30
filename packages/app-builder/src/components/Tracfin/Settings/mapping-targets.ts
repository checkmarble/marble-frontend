import type { TracfinCatalogField, TracfinMapping } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';

const UNKNOWN_POSITION = Number.POSITIVE_INFINITY;

/** `Infinity - Infinity` is `NaN`: equal positions compare as equal. */
function comparePositions(a: number, b: number): number {
  return a === b ? 0 : a - b;
}

// `field.order` is the rank among siblings only: document order is the position in `ordered_fields`.
const positionsByIndex = new WeakMap<TracfinCatalogIndex, Map<string, number>>();

function positionsOf(catalogIndex: TracfinCatalogIndex): Map<string, number> {
  let positions = positionsByIndex.get(catalogIndex);
  if (!positions) {
    positions = new Map(catalogIndex.profile.ordered_fields.map((id, position) => [id, position]));
    positionsByIndex.set(catalogIndex, positions);
  }
  return positions;
}

const targetFieldsByIndex = new WeakMap<TracfinCatalogIndex, TracfinCatalogField[]>();

/**
 * The fields a mapping can fill: every `editable` field, in document order. `calculated` fields are
 * filled by the server and `excluded` ones do not exist for the profile, so neither is offered.
 */
export function listMappingTargetFields(catalogIndex: TracfinCatalogIndex): TracfinCatalogField[] {
  let fields = targetFieldsByIndex.get(catalogIndex);
  if (!fields) {
    fields = catalogIndex.profile.ordered_fields
      .map((id) => catalogIndex.field(id))
      .filter((field): field is TracfinCatalogField => field?.kind === 'field' && field.coverage === 'editable');
    targetFieldsByIndex.set(catalogIndex, fields);
  }
  return fields;
}

export type TracfinMappingGroup = {
  /** The catalog block that owns the target fields, or `null` when the target is not in the catalog. */
  blockId: string | null;
  mappings: TracfinMapping[];
};

/** Mappings grouped by the block that owns their target field, blocks in document order, unknown targets last. */
export function groupMappingsByTargetBlock(
  mappings: readonly TracfinMapping[],
  catalogIndex: TracfinCatalogIndex,
): TracfinMappingGroup[] {
  const positions = positionsOf(catalogIndex);
  const positionOf = (id: string | null) => (id === null ? UNKNOWN_POSITION : (positions.get(id) ?? UNKNOWN_POSITION));

  const groups = new Map<string | null, TracfinMapping[]>();
  for (const mapping of mappings) {
    const blockId = catalogIndex.field(mapping.target_field) ? catalogIndex.ownerBlockOf(mapping.target_field) : null;
    groups.set(blockId, [...(groups.get(blockId) ?? []), mapping]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => comparePositions(positionOf(a), positionOf(b)))
    .map(([blockId, groupMappings]) => ({
      blockId,
      mappings: [...groupMappings].sort((a, b) =>
        comparePositions(positionOf(a.target_field), positionOf(b.target_field)),
      ),
    }));
}
