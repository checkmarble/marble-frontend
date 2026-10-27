import type { DataModel } from '@app-builder/models/data-model';
import type { TracfinMapping, TracfinMappingSource } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import * as R from 'remeda';
import { toMappingInput } from './form-state';
import { buildPathStep, getPathEndTable, TRACFIN_MAX_PATH_STEPS, type TracfinPathHop } from './path-hops';

/**
 * Pure edits of one mapping. They keep the mapping valid against the shape the server expects (no
 * member that does not apply to the current source or target) but never validate its content: the
 * server owns the diagnostics, the screen only shows them.
 */

export type TracfinEntityType = NonNullable<TracfinMappingSource['entity_type']>;

/** Snapshots of an operation count can be a unit: only the principal operation count qualifies. */
export const UNIT_OPERATION_TARGET_SUFFIX = '/operation/nombreOperations';

export function supportsUnitOperation(targetField: string): boolean {
  return targetField.endsWith(UNIT_OPERATION_TARGET_SUFFIX);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6).padEnd(4, '0');
}

/**
 * A mapping id is generated once and then stays: a slug of the target field and a short random
 * suffix, unique among `existingIds`.
 */
export function generateMappingId(
  targetField: string,
  existingIds: Iterable<string>,
  random: () => string = randomSuffix,
): string {
  const taken = new Set(existingIds);
  const slug =
    targetField
      .split('/')
      .filter(Boolean)
      .slice(-2)
      .join('-')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'mapping';
  let id = `${slug}-${random()}`;
  while (taken.has(id)) id = `${slug}-${random()}`;
  return id;
}

/** Members that only make sense for a decimal target: dropped when the target is not one. */
function withoutAmountMembers(mapping: TracfinMapping): TracfinMapping {
  return R.omit(mapping, ['unit', 'target_currency', 'currency']);
}

/**
 * Applies the target field's constraints to a mapping: code correspondences only for a target with
 * a code list (and only while the list is the same), amount members only for a decimal target, the
 * unit-operation flag only for the principal operation count, and the currency the profile proves.
 */
export function setTargetField(
  mapping: TracfinMapping,
  targetField: string,
  catalogIndex: TracfinCatalogIndex,
): TracfinMapping {
  const field = catalogIndex.field(targetField);
  let next: TracfinMapping = { ...mapping, target_field: targetField };

  const sameCodes = R.isDeepEqual(catalogIndex.codesFor(mapping.target_field), catalogIndex.codesFor(targetField));
  if (!sameCodes || catalogIndex.codesFor(targetField) === null) next = R.omit(next, ['codes']);

  if (field?.value_kind === 'decimal') {
    if (field.currency) next = { ...next, target_currency: field.currency };
  } else {
    next = withoutAmountMembers(next);
  }

  if (next.source.unit_operation !== undefined && !supportsUnitOperation(targetField)) {
    next = { ...next, source: R.omit(next.source, ['unit_operation']) };
  }
  return next;
}

export function createMapping({
  targetField,
  existingIds,
  catalogIndex,
  random,
}: {
  targetField: string;
  existingIds: Iterable<string>;
  catalogIndex: TracfinCatalogIndex;
  random?: () => string;
}): TracfinMapping {
  const base: TracfinMapping = {
    id: generateMappingId(targetField, existingIds, random),
    target_field: targetField,
    source: { kind: 'ingested', entity_type: 'Person' },
  };
  return setTargetField(base, targetField, catalogIndex);
}

/** A copy with its own id. Its path steps keep their ids: an identical hop must keep denoting the same step. */
export function duplicateMapping(
  mapping: TracfinMapping,
  existingIds: Iterable<string>,
  random?: () => string,
): TracfinMapping {
  return { ...toMappingInput(mapping), id: generateMappingId(mapping.target_field, existingIds, random) };
}

export function setSourceKind(mapping: TracfinMapping, kind: TracfinMappingSource['kind']): TracfinMapping {
  if (mapping.source.kind === kind) return mapping;
  const source: TracfinMappingSource = kind === 'ingested' ? { kind, entity_type: 'Person' } : { kind };
  return { ...mapping, source };
}

/**
 * Which entity types the ingested roots of a data model can be. The data model stores a legal person
 * as a `person` table whose sub entity is `moral`, and a natural person as `natural` (see
 * `apiSemanticTypeToFormEntity`); `generic` (partner) tables are never roots.
 */
export function listRootTables(dataModel: DataModel, entityType: TracfinEntityType): string[] {
  const subEntity = entityType === 'Person' ? 'natural' : 'moral';
  return dataModel
    .filter((table) => table.semanticType === 'person' && table.subEntity === subEntity)
    .map((table) => table.name);
}

/** Changing the entity type keeps the root table only while it is still a root of that type. */
export function setEntityType(
  mapping: TracfinMapping,
  entityType: TracfinEntityType,
  dataModel: DataModel,
): TracfinMapping {
  const table = mapping.source.table;
  const keepsTable = table !== undefined && listRootTables(dataModel, entityType).includes(table);
  return {
    ...mapping,
    source: keepsTable
      ? { ...mapping.source, entity_type: entityType }
      : { ...R.omit(mapping.source, ['table', 'field', 'path']), entity_type: entityType },
  };
}

/** A new root table starts a new path: the old steps and field belonged to the old table. */
export function setRootTable(mapping: TracfinMapping, table: string): TracfinMapping {
  if (mapping.source.table === table) return mapping;
  return { ...mapping, source: { ...R.omit(mapping.source, ['field', 'path']), table } };
}

export function setSourceField(mapping: TracfinMapping, field: string): TracfinMapping {
  return { ...mapping, source: { ...mapping.source, field } };
}

function withPath(mapping: TracfinMapping, path: NonNullable<TracfinMappingSource['path']>): TracfinMapping {
  const rootTable = mapping.source.table ?? '';
  const endChanged = getPathEndTable(rootTable, path) !== getPathEndTable(rootTable, mapping.source.path ?? []);
  // The source field is a field of the table the path ends on.
  const source = endChanged ? R.omit(mapping.source, ['field', 'path']) : R.omit(mapping.source, ['path']);
  return { ...mapping, source: path.length > 0 ? { ...source, path } : source };
}

/**
 * Chooses the hop of step `index`: the steps after it belonged to the old hop and are dropped. The
 * step reuses the id of an identical hop of another mapping of the same root table.
 */
export function setPathHop({
  mappings,
  mappingId,
  index,
  hop,
}: {
  mappings: readonly TracfinMapping[];
  mappingId: string;
  index: number;
  hop: Pick<TracfinPathHop, 'link' | 'direction' | 'table'>;
}): TracfinMapping[] {
  return mappings.map((mapping) => {
    if (mapping.id !== mappingId) return mapping;
    const kept = (mapping.source.path ?? []).slice(0, index);
    if (kept.length >= TRACFIN_MAX_PATH_STEPS) return mapping;
    const step = buildPathStep({ mappings, mappingId, rootTable: mapping.source.table ?? '', kept, hop });
    return withPath(mapping, [...kept, step]);
  });
}

/** Removes step `index` and the steps after it. */
export function removePathFrom(mapping: TracfinMapping, index: number): TracfinMapping {
  return withPath(mapping, (mapping.source.path ?? []).slice(0, index));
}

export function setHistoricalType(mapping: TracfinMapping, historicalType: string): TracfinMapping {
  return { ...mapping, source: { ...mapping.source, historical_type: historicalType } };
}

export function setUnitOperation(mapping: TracfinMapping, enabled: boolean): TracfinMapping {
  return {
    ...mapping,
    source: enabled ? { ...mapping.source, unit_operation: true } : R.omit(mapping.source, ['unit_operation']),
  };
}

// ---- Code correspondences ----

export function addCode(mapping: TracfinMapping): TracfinMapping {
  return { ...mapping, codes: [...(mapping.codes ?? []), { source: '', target: '' }] };
}

export function updateCode(
  mapping: TracfinMapping,
  index: number,
  patch: Partial<{ source: string; target: string }>,
): TracfinMapping {
  return { ...mapping, codes: (mapping.codes ?? []).map((code, i) => (i === index ? { ...code, ...patch } : code)) };
}

export function removeCode(mapping: TracfinMapping, index: number): TracfinMapping {
  const codes = (mapping.codes ?? []).filter((_, i) => i !== index);
  return codes.length > 0 ? { ...mapping, codes } : R.omit(mapping, ['codes']);
}

// ---- Amounts ----

export function setUnit(mapping: TracfinMapping, unit: 'major' | 'minor'): TracfinMapping {
  return { ...mapping, unit };
}

export function setTargetCurrency(mapping: TracfinMapping, currency: string): TracfinMapping {
  return { ...mapping, target_currency: currency };
}

export type CurrencyEvidenceMode = 'field' | 'constant';

export function getCurrencyEvidenceMode(mapping: TracfinMapping): CurrencyEvidenceMode | null {
  if (mapping.currency?.constant !== undefined) return 'constant';
  if (mapping.currency?.field !== undefined) return 'field';
  return null;
}

/**
 * Exactly one of a source currency field or a constant is allowed. A constant starts as the target
 * currency: the server supports no conversion, so another constant is refused.
 */
export function setCurrencyEvidenceMode(mapping: TracfinMapping, mode: CurrencyEvidenceMode): TracfinMapping {
  if (getCurrencyEvidenceMode(mapping) === mode) return mapping;
  return {
    ...mapping,
    currency: mode === 'constant' ? { constant: mapping.target_currency ?? '' } : { field: '' },
  };
}

export function setCurrencyEvidenceValue(mapping: TracfinMapping, value: string): TracfinMapping {
  const mode = getCurrencyEvidenceMode(mapping);
  if (mode === null) return mapping;
  return { ...mapping, currency: mode === 'constant' ? { constant: value } : { field: value } };
}

// ---- Discriminator ----

export function setDiscriminatorField(mapping: TracfinMapping, field: string): TracfinMapping {
  return { ...mapping, discriminator: { field, values: mapping.discriminator?.values ?? [] } };
}

export function addDiscriminatorValue(mapping: TracfinMapping): TracfinMapping {
  const current = mapping.discriminator ?? { field: '', values: [] };
  return { ...mapping, discriminator: { ...current, values: [...current.values, ''] } };
}

export function updateDiscriminatorValue(mapping: TracfinMapping, index: number, value: string): TracfinMapping {
  if (!mapping.discriminator) return mapping;
  const values = mapping.discriminator.values.map((existing, i) => (i === index ? value : existing));
  return { ...mapping, discriminator: { ...mapping.discriminator, values } };
}

export function removeDiscriminatorValue(mapping: TracfinMapping, index: number): TracfinMapping {
  if (!mapping.discriminator) return mapping;
  const values = mapping.discriminator.values.filter((_, i) => i !== index);
  return { ...mapping, discriminator: { ...mapping.discriminator, values } };
}

export function removeDiscriminator(mapping: TracfinMapping): TracfinMapping {
  return R.omit(mapping, ['discriminator']);
}
