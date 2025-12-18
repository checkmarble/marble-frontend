const MAX_FILTERS_PER_TABLE = 5;
const FILTERABLE_DATA_TYPES = ["String", "Timestamp"];
function isFilterableField(field) {
  return FILTERABLE_DATA_TYPES.includes(field.dataType) && field.name !== "updated_at";
}
function encodeFilterKey(tableId, selection) {
  if (selection.kind === "trigger") {
    return `${tableId}::trigger::${selection.fieldName}`;
  }
  return `${tableId}::ingested::${selection.path.join("->")}.${selection.fieldName}`;
}
function buildPersistedKey(tableId, payload) {
  if ("triggerObjectField" in payload) {
    return encodeFilterKey(tableId, { kind: "trigger", fieldName: payload.triggerObjectField });
  }
  return encodeFilterKey(tableId, {
    kind: "ingested",
    path: payload.ingestedDataField.path,
    fieldName: payload.ingestedDataField.name
  });
}
function toExportedFieldPayload(row) {
  if (!row.selection) return null;
  if (row.selection.kind === "trigger") {
    return { triggerObjectField: row.selection.fieldName };
  }
  return {
    ingestedDataField: {
      path: row.selection.path,
      name: row.selection.fieldName
    }
  };
}
function isRowComplete(row) {
  return row.triggerObjectType !== null && row.tableId !== null && row.selection !== null;
}
function isActiveRow(row) {
  return !row.isDeleted;
}
function hasIncompleteActiveRow(draftRows) {
  return draftRows.some((row) => isActiveRow(row) && !isRowComplete(row));
}
function getActiveCompleteRows(draftRows) {
  return draftRows.filter((row) => isActiveRow(row) && isRowComplete(row));
}
function getFieldSelectionLabel(tableName, selection) {
  if (selection.kind === "trigger") {
    return selection.fieldName;
  }
  return `-> ${selection.path.join("->")}.${selection.fieldName}`;
}
function buildExistingFilterRows(triggerObjectTypes, dataModel, exportedByTableId) {
  const triggerObjectTypeSet = new Set(triggerObjectTypes);
  return dataModel.filter((table) => triggerObjectTypeSet.has(table.name)).flatMap((table) => {
    const exported = exportedByTableId[table.id];
    if (!exported) return [];
    const triggerRows = exported.triggerObjectFields.map((fieldName) => {
      const payload = { triggerObjectField: fieldName };
      return {
        persistedKey: buildPersistedKey(table.id, payload),
        tableId: table.id,
        triggerObjectType: table.name,
        selection: { kind: "trigger", fieldName }
      };
    });
    const ingestedRows = exported.ingestedDataFields.filter((field) => Boolean(field.name)).map((field) => {
      const payload = { ingestedDataField: { path: field.path, name: field.name } };
      return {
        persistedKey: buildPersistedKey(table.id, payload),
        tableId: table.id,
        triggerObjectType: table.name,
        selection: { kind: "ingested", path: field.path, fieldName: field.name }
      };
    });
    return [...triggerRows, ...ingestedRows];
  });
}
function buildDraftRowsFromExisting(existingRows) {
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
    selection: row.selection
  }));
}
function createEmptyDraftRow() {
  return {
    id: crypto.randomUUID(),
    isNew: true,
    triggerObjectType: null,
    tableId: null,
    selection: null
  };
}
function diffFilterChanges(initialRows, draftRows) {
  const initialByKey = new Map(
    initialRows.map((row) => {
      const payload = toExportedFieldPayload(row);
      return [row.persistedKey, { tableId: row.tableId, payload }];
    })
  );
  const finalCompleteRows = getActiveCompleteRows(draftRows);
  const finalByKey = new Map(
    finalCompleteRows.map((row) => {
      const payload = toExportedFieldPayload(row);
      const persistedKey = buildPersistedKey(row.tableId, payload);
      return [persistedKey, { tableId: row.tableId, payload }];
    })
  );
  const toDelete = [...initialByKey.entries()].filter(([key]) => !finalByKey.has(key)).map(([, value]) => value);
  const toCreate = [...finalByKey.entries()].filter(([key]) => !initialByKey.has(key)).map(([, value]) => value);
  return { toCreate, toDelete };
}
function hasDraftChanges(initialRows, draftRows) {
  const { toCreate, toDelete } = diffFilterChanges(initialRows, draftRows);
  return toCreate.length > 0 || toDelete.length > 0;
}
function getFilterableTableConfig(table, dataModel) {
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
          fields: parentTable.fields.filter(isFilterableField)
        }
      ];
    })
  };
}
function getSelectionKey(tableId, selection) {
  return encodeFilterKey(tableId, selection);
}
function needsDeleteConfirmation(row, existingFilters) {
  if (row.persistedKey || !row.isNew) return true;
  if (!isRowComplete(row) || !row.tableId) return false;
  const payload = toExportedFieldPayload(row);
  if (!payload) return false;
  const key = buildPersistedKey(row.tableId, payload);
  return existingFilters.some((filter) => filter.persistedKey === key);
}
function canAddFilterRow(draftRows, tableConfigs) {
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
    {}
  );
  return tableConfigs.some((table) => (completeCountByTableId[table.tableId] ?? 0) < MAX_FILTERS_PER_TABLE);
}
export {
  buildDraftRowsFromExisting as a,
  buildExistingFilterRows as b,
  createEmptyDraftRow as c,
  hasDraftChanges as d,
  canAddFilterRow as e,
  isRowComplete as f,
  getFilterableTableConfig as g,
  hasIncompleteActiveRow as h,
  isActiveRow as i,
  getSelectionKey as j,
  diffFilterChanges as k,
  getFieldSelectionLabel as l,
  needsDeleteConfirmation as n
};
