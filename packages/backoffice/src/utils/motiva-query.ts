import type { MotivaProperties, MotivaQuery } from '@bo/schemas/screenings';
import type { DataModelObjectDto, TableDto } from 'marble-api';

const MOTIVA_QUERY_ID_PREFIX = 'backoffice-screening';

export const createMotivaQueryId = () => `${MOTIVA_QUERY_ID_PREFIX}-${crypto.randomUUID()}`;

export type MotivaQueryResult =
  | { success: true; query: MotivaQuery; queryId: string }
  | { success: false; reason: 'missing_ftm_entity' };

const ISO_DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})(?:[Tt\s]|$)/;

const formatDateValue = (value: unknown) => {
  const stringValue = String(value);
  const datePrefix = ISO_DATE_PREFIX.exec(stringValue)?.[1];
  if (datePrefix) return datePrefix;

  const parsedDate = new Date(stringValue);
  return Number.isNaN(parsedDate.getTime()) ? stringValue : parsedDate.toISOString().slice(0, 10);
};

const asStringValues = (value: unknown, formatDate: boolean): string[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap((item) => asStringValues(item, formatDate));
  if (typeof value === 'object') return [JSON.stringify(value)];
  return [formatDate ? formatDateValue(value) : String(value)];
};

export function buildMotivaQuery(table: TableDto, object: DataModelObjectDto, queryId: string): MotivaQueryResult {
  if (!table.ftm_entity) return { success: false, reason: 'missing_ftm_entity' };

  const properties: MotivaProperties = {};

  for (const field of Object.values(table.fields)) {
    if (!field.ftm_property) continue;

    const values = asStringValues(object.data[field.name], field.data_type === 'Timestamp');
    if (values.length === 0) continue;

    properties[field.ftm_property] = [...(properties[field.ftm_property] ?? []), ...values];
  }

  return {
    success: true,
    queryId,
    query: {
      queries: {
        [queryId]: {
          schema: table.ftm_entity,
          properties,
        },
      },
    },
  };
}
