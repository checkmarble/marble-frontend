import type { TracfinCatalogField } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex, TracfinFieldCodes } from '@app-builder/models/tracfin/catalog-index';

/**
 * The blocks that carry organization settings. The backend (`tracfinSettings`) only accepts editable
 * fields under `/ds/organisme/` and `/ds/contact/`; the declarant is never a setting, it comes from
 * the draft.
 */
export const TRACFIN_SETTINGS_BLOCK_IDS = [
  '/ds/organisme',
  '/ds/organisme/adresse',
  '/ds/contact',
  '/ds/contact/coordonnees',
] as const;

export type TracfinSettingKind = 'text' | 'decimal' | 'boolean';

export type TracfinSettingsFieldItem = {
  field: TracfinCatalogField;
  kind: TracfinSettingKind;
  /** Catalog `min >= 1`: TRACFIN expects it, saving is never blocked by it. */
  expectedByTracfin: boolean;
  codes: TracfinFieldCodes;
  /** Attributes of this field (simple content), shown under their owner. */
  attributes: TracfinSettingsFieldItem[];
};

export type TracfinSettingsSection = {
  blockId: string;
  fields: TracfinSettingsFieldItem[];
};

function settingKindOf(field: TracfinCatalogField): TracfinSettingKind {
  if (field.value_kind === 'decimal') return 'decimal';
  if (field.value_kind === 'boolean') return 'boolean';
  return 'text';
}

/**
 * « champ éditable singleton » under organisme / contact: editable (calculated and excluded nodes are
 * never asked), a single occurrence, and not an internal reference (a setting cannot be one).
 */
function isSettingsField(index: TracfinCatalogIndex, field: TracfinCatalogField): boolean {
  if (field.kind !== 'field' || field.coverage !== 'editable' || field.value_kind === 'reference') return false;
  if (!field.id.startsWith('/ds/organisme/') && !field.id.startsWith('/ds/contact/')) return false;
  return index.cardinality(field.id)?.max === 1;
}

function toItem(index: TracfinCatalogIndex, field: TracfinCatalogField): TracfinSettingsFieldItem {
  return {
    field,
    kind: settingKindOf(field),
    expectedByTracfin: (index.cardinality(field.id)?.min ?? 0) >= 1,
    codes: index.codesFor(field.id),
    attributes: index
      .attributesOf(field.id)
      .filter(({ field: attribute }) => isSettingsField(index, attribute))
      .map(({ field: attribute }) => toItem(index, attribute)),
  };
}

/** The settings form, driven by the catalog: sections without any editable field are left out. */
export function getTracfinSettingsLayout(index: TracfinCatalogIndex): TracfinSettingsSection[] {
  return TRACFIN_SETTINGS_BLOCK_IDS.map((blockId) => {
    const contents = index.fieldsOf(blockId);
    const fields = [...contents.fields, ...contents.attributes]
      .filter(({ field }) => isSettingsField(index, field))
      .map(({ field }) => toItem(index, field));
    return { blockId, fields };
  }).filter((section) => section.fields.length > 0);
}

/** Every field id of the settings form, attributes included. */
export function listSettingsFieldIds(layout: TracfinSettingsSection[]): string[] {
  const ids: string[] = [];
  const visit = (item: TracfinSettingsFieldItem) => {
    ids.push(item.field.id);
    item.attributes.forEach(visit);
  };
  layout.forEach((section) => section.fields.forEach(visit));
  return ids;
}
