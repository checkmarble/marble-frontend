import type { TracfinCatalogField } from '@app-builder/models/tracfin';
import type { TFunction } from 'i18next';

/** `/ds/organisme/adresse/pays/@type` -> `organisme_adresse_pays_attr_type` (same key scheme as the settings page). */
export function labelKeyOf(catalogId: string): string {
  return catalogId
    .replace(/^\/ds\/?/, '')
    .replace(/\/@/g, '_attr_')
    .replace(/\//g, '_');
}

/** `codePostal` -> `Code postal`; `@numeroCarteBancaire` -> `Numero carte bancaire`. A last resort, when no translation exists. */
export function humanizeName(name: string): string {
  const words = name
    .replace(/^@/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

type Translate = TFunction<['tracfin']>;

/** The label of a field: `draft.fields.*`, then the settings page's `settings.fields.*`, then the catalog name. */
export function fieldLabel(t: Translate, field: Pick<TracfinCatalogField, 'id' | 'name'>): string {
  const key = labelKeyOf(field.id);
  return (t as unknown as (keys: string[], options: { defaultValue: string }) => string)(
    [`tracfin:draft.fields.${key}`, `tracfin:settings.fields.${key}`],
    { defaultValue: humanizeName(field.name) },
  );
}

/** The title of a block. */
export function blockLabel(t: Translate, block: Pick<TracfinCatalogField, 'id' | 'name'>): string {
  const key = labelKeyOf(block.id);
  return (t as unknown as (keys: string[], options: { defaultValue: string }) => string)(
    [`tracfin:draft.blocks.${key}`],
    { defaultValue: humanizeName(block.name) },
  );
}

/** Largest `maxLength` of the field (the strictest one wins), or `null`. */
export function maxLengthOf(field: TracfinCatalogField): number | null {
  const lengths = field.constraints
    .filter((constraint) => constraint.kind === 'maxLength')
    .map((constraint) => Number(constraint.value))
    .filter((value) => Number.isFinite(value));
  return lengths.length === 0 ? null : Math.min(...lengths);
}

export const DECIMAL_FORMAT = /^-?\d+(\.\d+)?$/;
export const DATE_PATTERN_SOURCE = '\\d{2}/\\d{2}/\\d{4}';

export function isDateField(field: TracfinCatalogField): boolean {
  return field.constraints.some(
    (constraint) => constraint.kind === 'pattern' && constraint.value === DATE_PATTERN_SOURCE,
  );
}

/** A long text gets a textarea: the analysis, the free-text fields of several hundred characters. */
export function isLongText(field: TracfinCatalogField): boolean {
  return field.id === '/ds/analyse' || (maxLengthOf(field) ?? 0) >= 500;
}
