import type { TracfinCatalogField, TracfinProfile } from './index';

/** A catalog node as the UI should see it: `calculated` nodes are filled by the server and never asked. */
export type TracfinCatalogEntry = {
  field: TracfinCatalogField;
  calculated: boolean;
};

export type TracfinBlockContents = {
  /** Child blocks, in catalog order. */
  readonly blocks: readonly TracfinCatalogEntry[];
  /** Scalar fields (elements), in catalog order. Attributes of simple content are under `attributesOf`. */
  readonly fields: readonly TracfinCatalogEntry[];
  /** Attributes carried directly by the block (for example the card number of a card block). */
  readonly attributes: readonly TracfinCatalogEntry[];
};

export type TracfinCodeOption = { value: string; label: string };

/**
 * - an array: the values to choose from
 * - `'unavailable'`: a referenced code list is not shipped in the catalog, so no list can be offered
 * - `null`: the field has neither a code list nor an enumeration
 */
export type TracfinFieldCodes = readonly TracfinCodeOption[] | 'unavailable' | null;

/** `max: null` is unbounded. */
export type TracfinCardinality = { min: number; max: number | null };

export type TracfinChoiceGroup = {
  id: string;
  cardinality: TracfinCardinality;
  /** Blocks and fields of the owner block that belong to the group, in catalog order. */
  members: readonly TracfinCatalogEntry[];
};

export type TracfinCatalogIndex = {
  readonly profile: TracfinProfile;
  field: (id: string) => TracfinCatalogField | undefined;
  fieldsOf: (blockCatalogId: string) => TracfinBlockContents;
  attributesOf: (fieldId: string) => readonly TracfinCatalogEntry[];
  ownerBlockOf: (fieldId: string) => string | null;
  codesFor: (fieldId: string) => TracfinFieldCodes;
  cardinality: (id: string) => TracfinCardinality | null;
  choiceGroups: (blockCatalogId: string) => readonly TracfinChoiceGroup[];
};

const UNBOUNDED = 'unbounded';
const NON_NEGATIVE_INTEGER = /^\d+$/;

/**
 * Only the literal `unbounded` means "no maximum". Anything else that is not a non-negative integer
 * is a corrupt catalog: it is refused rather than read as unbounded (or as 0), which would silently
 * lift or drop a limit.
 */
function parseCardinality(id: string, bounds: { min: string; max: string }): TracfinCardinality {
  if (!NON_NEGATIVE_INTEGER.test(bounds.min) || !(bounds.max === UNBOUNDED || NON_NEGATIVE_INTEGER.test(bounds.max))) {
    throw new Error(
      `Invalid TRACFIN catalog cardinality for ${id}: min ${JSON.stringify(bounds.min)}, max ${JSON.stringify(bounds.max)} (expected non-negative integers, max may be "${UNBOUNDED}")`,
    );
  }
  return { min: Number(bounds.min), max: bounds.max === UNBOUNDED ? null : Number(bounds.max) };
}

function toEntry(field: TracfinCatalogField): TracfinCatalogEntry {
  return { field, calculated: field.coverage === 'calculated' };
}

const NO_ENTRIES: readonly TracfinCatalogEntry[] = Object.freeze([]);
const EMPTY_CONTENTS: TracfinBlockContents = { blocks: NO_ENTRIES, fields: NO_ENTRIES, attributes: NO_ENTRIES };

// Catalog ids and CSV names are data: never resolve them through the object prototype.
function own<T>(record: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

/** Builds the lookup tables once. Prefer {@link getTracfinCatalogIndex}, which memoises by profile hash. */
export function createTracfinCatalogIndex(profile: TracfinProfile): TracfinCatalogIndex {
  const fields = profile.fields;

  // Children are kept in catalog `order`; `excluded` nodes never enter the index.
  const childrenByParent = new Map<string, TracfinCatalogField[]>();
  for (const field of Object.values(fields)) {
    if (field.coverage === 'excluded') continue;
    const siblings = childrenByParent.get(field.parent);
    if (siblings) siblings.push(field);
    else childrenByParent.set(field.parent, [field]);
  }
  for (const siblings of childrenByParent.values()) siblings.sort((a, b) => a.order - b.order);

  const contentsByBlock = new Map<string, TracfinBlockContents>();
  for (const [parentId, children] of childrenByParent) {
    if (own(fields, parentId)?.kind !== 'block') continue;
    const blocks: TracfinCatalogEntry[] = [];
    const scalars: TracfinCatalogEntry[] = [];
    const attributes: TracfinCatalogEntry[] = [];
    for (const child of children) {
      if (child.kind === 'block') blocks.push(toEntry(child));
      else if (child.attribute) attributes.push(toEntry(child));
      else scalars.push(toEntry(child));
    }
    contentsByBlock.set(parentId, { blocks, fields: scalars, attributes });
  }

  const choicesByBlock = new Map<string, TracfinProfile['choices']>();
  for (const choice of profile.choices) {
    const siblings = choicesByBlock.get(choice.parent);
    if (siblings) siblings.push(choice);
    else choicesByBlock.set(choice.parent, [choice]);
  }

  // Every bound is read once, here: a malformed catalog fails when the index is built, not when a limit is used.
  const cardinalities = new Map<string, TracfinCardinality>();
  for (const field of Object.values(fields)) cardinalities.set(field.id, parseCardinality(field.id, field));
  for (const choice of profile.choices) cardinalities.set(choice.id, parseCardinality(choice.id, choice));

  const codesCache = new Map<string, TracfinFieldCodes>();

  function computeCodes(field: TracfinCatalogField): TracfinFieldCodes {
    if (field.catalogs.length > 0) {
      // A partial list presented as complete would mislead: any missing list makes the field unavailable.
      if (field.catalogs.some((name) => own(profile.codes, name) === undefined)) return 'unavailable';
      const options = new Map<string, TracfinCodeOption>();
      for (const name of field.catalogs) {
        const excluded = new Set(own(profile.excluded_codes, name) ?? []);
        for (const code of own(profile.codes, name) ?? []) {
          if (!excluded.has(code.value) && !options.has(code.value)) {
            options.set(code.value, { value: code.value, label: code.label });
          }
        }
      }
      return [...options.values()];
    }
    const enumeration = field.constraints.filter((constraint) => constraint.kind === 'enumeration');
    if (enumeration.length === 0) return null;
    return enumeration.map((constraint) => ({ value: constraint.value, label: constraint.value }));
  }

  return {
    profile,
    field: (id) => own(fields, id),
    fieldsOf: (blockCatalogId) => contentsByBlock.get(blockCatalogId) ?? EMPTY_CONTENTS,
    attributesOf: (fieldId) => {
      if (own(fields, fieldId)?.kind !== 'field') return NO_ENTRIES;
      return (childrenByParent.get(fieldId) ?? []).filter((child) => child.attribute).map(toEntry);
    },
    // Same rule as the backend `CompatibleParent`: climb through scalar parents to the enclosing block.
    ownerBlockOf: (fieldId) => {
      let ownerId = own(fields, fieldId)?.parent;
      while (ownerId) {
        const owner = own(fields, ownerId);
        if (!owner) return null;
        if (owner.kind === 'block') return owner.id;
        ownerId = owner.parent;
      }
      return null;
    },
    codesFor: (fieldId) => {
      const field = own(fields, fieldId);
      if (!field) return null;
      if (!codesCache.has(fieldId)) codesCache.set(fieldId, computeCodes(field));
      return codesCache.get(fieldId) ?? null;
    },
    cardinality: (id) => cardinalities.get(id) ?? null,
    choiceGroups: (blockCatalogId) =>
      (choicesByBlock.get(blockCatalogId) ?? []).map((choice) => ({
        id: choice.id,
        cardinality: parseCardinality(choice.id, choice),
        members: (childrenByParent.get(blockCatalogId) ?? [])
          .filter((child) => child.choice === choice.id)
          .map(toEntry),
      })),
  };
}

const indexesByHash = new Map<string, TracfinCatalogIndex>();

/** The index of a profile, built on first use and reused while the profile hash is unchanged. */
export function getTracfinCatalogIndex(profile: TracfinProfile): TracfinCatalogIndex {
  let index = indexesByHash.get(profile.hash);
  if (!index) {
    index = createTracfinCatalogIndex(profile);
    indexesByHash.set(profile.hash, index);
  }
  return index;
}
