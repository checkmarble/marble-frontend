import type { DetailedCaseDecision } from '@app-builder/models/cases';

const MAX_TRIGGER_FIELDS = 3;
const MAX_VALUE_LENGTH = 40;
/** Fields that say nothing to the analyst about the operation. */
const HIDDEN_FIELDS = new Set(['object_id', 'updated_at', 'valid_from', 'valid_until']);

export type TriggerSummary = {
  /** `triggerObject.object_id`, exactly as the decision recorded it. */
  objectId: string | null;
  /** A few scalar fields of the trigger object, for recognition only. Their values are never computed with. */
  fields: { name: string; value: string }[];
};

const isScalar = (value: unknown): value is string | number | boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

/** The object id and up to three scalar fields of the object that triggered the decision. */
export function summarizeTrigger(triggerObject: DetailedCaseDecision['triggerObject']): TriggerSummary {
  const rawId = triggerObject?.['object_id'];
  const objectId = isScalar(rawId) ? String(rawId) : null;
  const fields: TriggerSummary['fields'] = [];
  for (const [name, value] of Object.entries(triggerObject ?? {})) {
    if (fields.length >= MAX_TRIGGER_FIELDS) break;
    if (HIDDEN_FIELDS.has(name) || !isScalar(value)) continue;
    const text = String(value);
    if (text === '') continue;
    fields.push({
      name,
      value: text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH - 1)}…` : text,
    });
  }
  return { objectId, fields };
}

/** The first 8 characters of a decision id, for a line whose decision is not among the loaded ones. */
export const shortDecisionId = (id: string): string => id.slice(0, 8);
