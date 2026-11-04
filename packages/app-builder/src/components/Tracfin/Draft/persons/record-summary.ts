import type { TracfinNavigationPage } from '@app-builder/models/tracfin';

export type RecordSummary = {
  recordId: string;
  /** The value of the caption field of the table, when it has one that differs from the id. */
  caption: string | null;
  /** A few other fields, to tell two records apart. */
  fields: { name: string; value: string }[];
};

const HIDDEN_FIELDS = new Set(['object_id', 'updated_at', 'valid_from', 'valid_until']);
const MAX_FIELDS = 3;

function scalar(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() === '' ? null : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

/**
 * What identifies a record on screen: its id, the caption of its table, and up to three other
 * fields (in the order of the data model when it is known, else in the order they arrive).
 */
export function summarizeRecord(
  data: Record<string, unknown>,
  { captionField, fieldOrder }: { captionField?: string; fieldOrder?: readonly string[] } = {},
): RecordSummary {
  const recordId = scalar(data['object_id']) ?? '';
  const caption = captionField && captionField !== 'object_id' ? scalar(data[captionField]) : null;
  const names = [...(fieldOrder ?? []), ...Object.keys(data)].filter((name, index, all) => all.indexOf(name) === index);
  const fields: RecordSummary['fields'] = [];
  for (const name of names) {
    if (fields.length >= MAX_FIELDS) break;
    if (HIDDEN_FIELDS.has(name) || name === captionField) continue;
    const value = scalar(data[name]);
    if (value !== null) fields.push({ name, value });
  }
  return { recordId, caption, fields };
}

/** The server may answer 200 with this diagnostic and no object when an inverse hop has no usable index. */
export function isIndexUnavailable(page: Pick<TracfinNavigationPage, 'diagnostics'>): boolean {
  return (page.diagnostics ?? []).some((diagnostic) => diagnostic.code === 'NAVIGATION_INDEX_UNAVAILABLE');
}
