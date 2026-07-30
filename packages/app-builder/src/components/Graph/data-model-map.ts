import { type DataModel, type FtmEntityPersonOption, type TableModel } from '@app-builder/models/data-model';

export type GraphTypeMeta =
  | { kind: 'person'; semanticType: 'person'; defaultSubEntity: FtmEntityPersonOption }
  | { kind: 'other' };

function metaFromTable(table: TableModel): GraphTypeMeta {
  const semanticType = table.semanticType ?? 'other';
  if (semanticType === 'person') {
    return {
      kind: 'person',
      semanticType: 'person',
      defaultSubEntity: table.subEntity ?? 'generic',
    };
  }
  return { kind: 'other' };
}

/**
 * Infers whether a graph node `type` (= data-model table name) is a person table.
 * Non-person / missing tables are not treated as pivots — pivots use `connector: true`.
 */
export function graphTypeToSemantic(objectType: string, dataModel: DataModel): GraphTypeMeta {
  const table = dataModel.find((t) => t.name === objectType);
  if (!table) return { kind: 'other' };
  return metaFromTable(table);
}

/** Display label for a table: alias when set, otherwise the table name. */
export function objectTypeLabel(objectType: string, dataModel: DataModel): string {
  const table = dataModel.find((t) => t.name === objectType);
  if (!table) return objectType;
  return table.alias.trim() || table.name;
}

export function createGraphTypeHelpers(dataModel: DataModel) {
  const byName = new Map(dataModel.map((t) => [t.name, t]));

  function resolveGraphTypeMeta(objectType: string): GraphTypeMeta {
    const table = byName.get(objectType);
    if (!table) return { kind: 'other' };
    return metaFromTable(table);
  }

  return {
    resolveGraphTypeMeta,
    isPersonType(objectType: string): boolean {
      return resolveGraphTypeMeta(objectType).kind === 'person';
    },
    getPersonSubEntity(objectType: string): FtmEntityPersonOption {
      const meta = resolveGraphTypeMeta(objectType);
      if (meta.kind === 'person') return meta.defaultSubEntity;
      return 'generic';
    },
    getObjectTypeLabel(objectType: string): string {
      const table = byName.get(objectType);
      if (!table) return objectType;
      return table.alias.trim() || table.name;
    },
  };
}

export type GraphTypeHelpers = ReturnType<typeof createGraphTypeHelpers>;
