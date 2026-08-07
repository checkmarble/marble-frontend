import { type DataModelObjectValue } from '@app-builder/models/data-model';

const TITLE_FIELD_CANDIDATES = ['name', 'full_name', 'company_name', 'display_name', 'label'] as const;

export function resolveTitle(data: Record<string, DataModelObjectValue>, objectId: string): string {
  for (const key of TITLE_FIELD_CANDIDATES) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  const objectIdValue = data['object_id'];
  if (typeof objectIdValue === 'string' && objectIdValue.trim()) return objectIdValue;
  return objectId;
}
