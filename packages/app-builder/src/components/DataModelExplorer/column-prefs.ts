import { type TableModel } from '@app-builder/models';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { getLocalStorageItem, setLocalStorageItem } from '@app-builder/utils/local-storage';
import { useMemo, useState } from 'react';
import * as R from 'remeda';
import { z } from 'zod/v4';

/** Leaves room for the filter and pin buttons of a header. */
export const MIN_COLUMN_WIDTH = 100;

const columnPrefsSchema = z.object({
  visible: z.array(z.string()),
  pinned: z.array(z.string()),
  // Missing from the prefs saved before columns could be resized.
  widths: z.record(z.string(), z.number()).catch({}),
});

/**
 * `visible` is ordered: it is the column order. `pinned` is always a subset of `visible`.
 * `widths` holds, in pixels, the columns the user resized: the others follow their content.
 */
export type ColumnPrefs = z.infer<typeof columnPrefsSchema>;

type PrefsField = Pick<TableModel['fields'][number], 'name' | 'hidden'>;

/**
 * Stored prefs outlive the data model: drop columns that no longer exist, and fall back to the
 * data model default (non-hidden fields, in data model order) when nothing usable is stored.
 * Fields added after the prefs were saved stay out of `visible` (they show up as available).
 */
export function reconcileColumnPrefs(stored: unknown, fields: PrefsField[]): ColumnPrefs {
  const parsed = columnPrefsSchema.safeParse(stored);
  const saved = parsed.success ? parsed.data : { visible: [], pinned: [], widths: {} };
  const names = new Set(fields.map((field) => field.name));
  const visible = [...new Set(saved.visible)].filter((name) => names.has(name));
  // A hidden column keeps its width for when it is shown again.
  const widths = R.pipe(
    saved.widths,
    R.pickBy((_, name) => names.has(name)),
    R.mapValues((width) => Math.max(MIN_COLUMN_WIDTH, width)),
  );

  if (visible.length === 0) {
    return { visible: fields.filter((field) => !field.hidden).map((field) => field.name), pinned: [], widths };
  }

  // Pinned columns follow the `visible` order, so reordering columns also reorders the pinned ones.
  return { visible, pinned: visible.filter((name) => saved.pinned.includes(name)), widths };
}

export function useColumnPrefs(table: TableModel) {
  const { org } = useOrganizationDetails();
  const key = `data-explorer:columns:${org.id}:${table.name}`;
  const [stored, setStored] = useState<unknown>(() => getLocalStorageItem(key));
  const prefs = useMemo(() => reconcileColumnPrefs(stored, table.fields), [stored, table.fields]);

  const setPrefs = (next: ColumnPrefs) => {
    setStored(next);
    setLocalStorageItem(key, next);
  };

  return [prefs, setPrefs] as const;
}
