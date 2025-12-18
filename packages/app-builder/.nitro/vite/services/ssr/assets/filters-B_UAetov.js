import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const getFilters = (exportedEntries, dataModel) => {
  const exportedFieldsByTable = Object.fromEntries(exportedEntries);
  const tableIdToName = new Map(dataModel.map((t) => [t.id, t.name]));
  return Object.entries(exportedFieldsByTable).flatMap(([tableId, exported]) => {
    const tableName = tableIdToName.get(tableId) ?? "";
    const triggerFilters = (exported.triggerObjectFields ?? []).map((field) => ({
      id: `${tableId}::trigger::${field}`,
      tableId,
      associatedObject: tableName,
      definition: tableName ? `${tableName}.${field}` : field,
      kind: "trigger",
      field
    }));
    const ingestedFilters = (exported.ingestedDataFields ?? []).filter((field) => Boolean(field?.name)).map((field) => {
      const pathArr = Array.isArray(field.path) ? field.path : [];
      const pathStr = pathArr.join("->");
      return {
        id: `${tableId}::ingested::${pathStr}.${field.name}`,
        tableId,
        associatedObject: tableName,
        definition: `${tableName}->${pathStr}.${field.name}`,
        kind: "ingested",
        field: field.name,
        name: field.name,
        path: pathArr
      };
    });
    return [...triggerFilters, ...ingestedFilters];
  });
};
const getAllowedTables = (filters, dataModel) => {
  const MAX_FILTERS_PER_TABLE = 5;
  const filterCountByTableId = filters.reduce((acc, filter) => {
    acc[filter.tableId] = (acc[filter.tableId] ?? 0) + 1;
    return acc;
  }, {});
  return dataModel.filter((table) => (filterCountByTableId[table.id] ?? 0) < MAX_FILTERS_PER_TABLE).map((t) => t.id);
};
const getTriggerFieldItems = (filters, allowedTables, dataModel) => {
  const existingFilterIds = new Set(filters.map(({
    id
  }) => id));
  return dataModel.filter(({
    id
  }) => allowedTables.includes(id)).flatMap((table) => table.fields.map((field) => ({
    tableId: table.id,
    tableName: table.name,
    fieldName: field.name,
    label: `${table.name}.${field.name}`
  }))).filter((item) => !existingFilterIds.has(`${item.tableId}::trigger::${item.fieldName}`));
};
const getLinkedFieldItems = (pivots, allowedTables, dataModel) => pivots.filter((pivot) => pivot.type === "link").filter(({
  pivotTableId
}) => allowedTables.includes(pivotTableId)).flatMap(({
  pivotTableId,
  baseTableId,
  pathLinks,
  baseTable
}) => {
  const targetTable = dataModel.find(({
    id
  }) => id === pivotTableId);
  if (!targetTable) return [];
  return targetTable.fields.map(({
    name
  }) => ({
    baseTableId,
    pathLinks,
    fieldName: name,
    label: `${baseTable}->${pathLinks.join("->")}.${name}`
  }));
});
const filtersLoader_createServerFn_handler = createServerRpc({
  id: "4d86840ff3e9c7863c69d2b486dfb6807b55958410e70bdf312d7b4e94cd18f0",
  name: "filtersLoader",
  filename: "src/routes/_app/_builder/settings/analytics/filters.tsx"
}, (opts) => filtersLoader.__executeServer(opts));
const filtersLoader = createServerFn().middleware([authMiddleware]).handler(filtersLoader_createServerFn_handler, async function filtersLoader2({
  context
}) {
  const {
    dataModelRepository
  } = context.authInfo;
  const dataModel = await dataModelRepository.getDataModel();
  const exportedEntries = await Promise.all(dataModel.map(async (table) => {
    const exported = await dataModelRepository.getDataModelTableExportedFields(table.id);
    return [table.id, exported];
  }));
  const filters = getFilters(exportedEntries, dataModel);
  const allowedTables = getAllowedTables(filters, dataModel);
  const triggerFieldItems = getTriggerFieldItems(filters, allowedTables, dataModel);
  const pivots = await dataModelRepository.listPivots({});
  const linkedFieldItems = getLinkedFieldItems(pivots, allowedTables, dataModel);
  return {
    filters,
    dataModel,
    pivots,
    allowedTables,
    triggerFieldItems,
    linkedFieldItems
  };
});
export {
  filtersLoader_createServerFn_handler
};
