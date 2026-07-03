import type { DataModelField, ExportedFields, LinkToSingle, TableModel } from '@app-builder/models/data-model';
import type { ExportedFieldPayload } from '@app-builder/schemas/settings';

export const MAX_FILTERS_PER_TABLE = 5;

const FILTERABLE_DATA_TYPES = ['String', 'Timestamp'] as const;

export function isFilterableField(field: DataModelField): boolean {
  return (
    FILTERABLE_DATA_TYPES.includes(field.dataType as (typeof FILTERABLE_DATA_TYPES)[number]) &&
    field.name !== 'updated_at'
  );
}

export type CustomFilterSelection =
  | { kind: 'trigger'; fieldName: string }
  | { kind: 'ingested'; path: string[]; fieldName: string };

export type CustomFilterDraftRow = {
  id: string;
  persistedKey?: string;
  isNew: boolean;
  isDeleted?: boolean;
  triggerObjectType: string | null;
  tableId: string | null;
  selection: CustomFilterSelection | null;
};

export type ExistingCustomFilterRow = {
  persistedKey: string;
  tableId: string;
  triggerObjectType: string;
  selection: CustomFilterSelection;
};

export type CustomFilterTableConfig = {
  tableId: string;
  tableName: string;
  fields: DataModelField[];
  links: Array<{
    link: LinkToSingle;
    parentTableId: string;
    parentTableName: string;
    fields: DataModelField[];
  }>;
};

function encodeFilterKey(tableId: string, selection: CustomFilterSelection): string {
  if (selection.kind === 'trigger') {
    return `${tableId}::trigger::${selection.fieldName}`;
  }
  return `${tableId}::ingested::${selection.path.join('->')}.${selection.fieldName}`;
}

export function buildPersistedKey(tableId: string, payload: ExportedFieldPayload): string {
  if ('triggerObjectField' in payload) {
    return encodeFilterKey(tableId, { kind: 'trigger', fieldName: payload.triggerObjectField });
  }
  return encodeFilterKey(tableId, {
    kind: 'ingested',
    path: payload.ingestedDataField.path,
    fieldName: payload.ingestedDataField.name,
  });
}

export function toExportedFieldPayload(row: Pick<CustomFilterDraftRow, 'selection'>): ExportedFieldPayload | null {
  if (!row.selection) return null;

  if (row.selection.kind === 'trigger') {
    return { triggerObjectField: row.selection.fieldName };
  }

  return {
    ingestedDataField: {
      path: row.selection.path,
      name: row.selection.fieldName,
    },
  };
}

export function isRowComplete(row: CustomFilterDraftRow): boolean {
  return row.triggerObjectType !== null && row.tableId !== null && row.selection !== null;
}

export function isActiveRow(row: CustomFilterDraftRow): boolean {
  return !row.isDeleted;
}

export function hasIncompleteActiveRow(draftRows: CustomFilterDraftRow[]): boolean {
  return draftRows.some((row) => isActiveRow(row) && !isRowComplete(row));
}

export function getActiveCompleteRows(draftRows: CustomFilterDraftRow[]): CustomFilterDraftRow[] {
  return draftRows.filter((row) => isActiveRow(row) && isRowComplete(row));
}

export function getFieldSelectionLabel(tableName: string, selection: CustomFilterSelection): string {
  if (selection.kind === 'trigger') {
    return selection.fieldName;
  }
  return `-> ${selection.path.join('->')}.${selection.fieldName}`;
}

export function buildExistingFilterRows(
  triggerObjectTypes: string[],
  dataModel: TableModel[],
  exportedByTableId: Record<string, ExportedFields>,
): ExistingCustomFilterRow[] {
  const triggerObjectTypeSet = new Set(triggerObjectTypes);

  return dataModel
    .filter((table) => triggerObjectTypeSet.has(table.name))
    .flatMap((table) => {
      const exported = exportedByTableId[table.id];
      if (!exported) return [];

      const triggerRows: ExistingCustomFilterRow[] = exported.triggerObjectFields.map((fieldName) => {
        const payload = { triggerObjectField: fieldName };
        return {
          persistedKey: buildPersistedKey(table.id, payload),
          tableId: table.id,
          triggerObjectType: table.name,
          selection: { kind: 'trigger', fieldName },
        };
      });

      const ingestedRows: ExistingCustomFilterRow[] = exported.ingestedDataFields
        .filter((field) => Boolean(field.name))
        .map((field) => {
          const payload = { ingestedDataField: { path: field.path, name: field.name } };
          return {
            persistedKey: buildPersistedKey(table.id, payload),
            tableId: table.id,
            triggerObjectType: table.name,
            selection: { kind: 'ingested', path: field.path, fieldName: field.name },
          };
        });

      return [...triggerRows, ...ingestedRows];
    });
}

export function buildDraftRowsFromExisting(existingRows: ExistingCustomFilterRow[]): CustomFilterDraftRow[] {
  if (existingRows.length === 0) {
    return [createEmptyDraftRow()];
  }

  return existingRows.map((row) => ({
    id: row.persistedKey,
    persistedKey: row.persistedKey,
    isNew: false,
    isDeleted: false,
    triggerObjectType: row.triggerObjectType,
    tableId: row.tableId,
    selection: row.selection,
  }));
}

export function createEmptyDraftRow(): CustomFilterDraftRow {
  return {
    id: crypto.randomUUID(),
    isNew: true,
    triggerObjectType: null,
    tableId: null,
    selection: null,
  };
}

export function diffFilterChanges(
  initialRows: ExistingCustomFilterRow[],
  draftRows: CustomFilterDraftRow[],
): {
  toCreate: Array<{ tableId: string; payload: ExportedFieldPayload }>;
  toDelete: Array<{ tableId: string; payload: ExportedFieldPayload }>;
} {
  const initialByKey = new Map(
    initialRows.map((row) => {
      const payload = toExportedFieldPayload(row)!;
      return [row.persistedKey, { tableId: row.tableId, payload }] as const;
    }),
  );

  const finalCompleteRows = getActiveCompleteRows(draftRows);
  const finalByKey = new Map(
    finalCompleteRows.map((row) => {
      const payload = toExportedFieldPayload(row)!;
      const persistedKey = buildPersistedKey(row.tableId!, payload);
      return [persistedKey, { tableId: row.tableId!, payload }] as const;
    }),
  );

  const toDelete = [...initialByKey.entries()].filter(([key]) => !finalByKey.has(key)).map(([, value]) => value);

  const toCreate = [...finalByKey.entries()].filter(([key]) => !initialByKey.has(key)).map(([, value]) => value);

  return { toCreate, toDelete };
}

export function hasDraftChanges(initialRows: ExistingCustomFilterRow[], draftRows: CustomFilterDraftRow[]): boolean {
  const { toCreate, toDelete } = diffFilterChanges(initialRows, draftRows);
  return toCreate.length > 0 || toDelete.length > 0;
}

export function getFilterableTableConfig(table: TableModel, dataModel: TableModel[]): CustomFilterTableConfig {
  const tablesById = new Map(dataModel.map((item) => [item.id, item]));

  return {
    tableId: table.id,
    tableName: table.name,
    fields: table.fields.filter(isFilterableField),
    links: table.linksToSingle.flatMap((link) => {
      const parentTable = tablesById.get(link.parentTableId);
      if (!parentTable) return [];

      return [
        {
          link,
          parentTableId: parentTable.id,
          parentTableName: parentTable.name,
          fields: parentTable.fields.filter(isFilterableField),
        },
      ];
    }),
  };
}

export function getSelectionKey(tableId: string, selection: CustomFilterSelection): string {
  return encodeFilterKey(tableId, selection);
}

export function needsDeleteConfirmation(
  row: CustomFilterDraftRow,
  existingFilters: ExistingCustomFilterRow[],
): boolean {
  if (row.persistedKey || !row.isNew) return true;
  if (!isRowComplete(row) || !row.tableId) return false;

  const payload = toExportedFieldPayload(row);
  if (!payload) return false;

  const key = buildPersistedKey(row.tableId, payload);
  return existingFilters.some((filter) => filter.persistedKey === key);
}

export function canAddFilterRow(draftRows: CustomFilterDraftRow[], tableConfigs: CustomFilterTableConfig[]): boolean {
  if (hasIncompleteActiveRow(draftRows)) {
    return false;
  }

  const completeCountByTableId = getActiveCompleteRows(draftRows).reduce(
    (acc, row) => {
      if (row.tableId) {
        acc[row.tableId] = (acc[row.tableId] ?? 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return tableConfigs.some((table) => (completeCountByTableId[table.tableId] ?? 0) < MAX_FILTERS_PER_TABLE);
}
