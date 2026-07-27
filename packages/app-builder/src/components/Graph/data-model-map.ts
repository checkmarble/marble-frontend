import {
  type DataModel,
  type FtmEntityPersonOption,
  type FtmEntityV2,
  type TableModel,
} from '@app-builder/models/data-model';

export type NonPersonSemantic = Exclude<FtmEntityV2, 'person'>;

export type GraphTypeMeta =
  | { kind: 'person'; semanticType: 'person'; defaultSubEntity: FtmEntityPersonOption }
  | { kind: 'entity'; semanticType: NonPersonSemantic }
  | { kind: 'pivot' };

function metaFromTable(table: TableModel): GraphTypeMeta {
  const semanticType = table.semanticType ?? 'other';
  if (semanticType === 'person') {
    return {
      kind: 'person',
      semanticType: 'person',
      defaultSubEntity: table.subEntity ?? 'generic',
    };
  }
  return { kind: 'entity', semanticType };
}

/**
 * Infers Marble semantic type from a graph node `type` (= data-model table name).
 * Types with no matching table are pivots — path glue only, not group nodes.
 */
export function graphTypeToSemantic(objectType: string, dataModel: DataModel): GraphTypeMeta {
  const table = dataModel.find((t) => t.name === objectType);
  if (!table) return { kind: 'pivot' };
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
    if (!table) return { kind: 'pivot' };
    return metaFromTable(table);
  }

  return {
    resolveGraphTypeMeta,
    isPersonType(objectType: string): boolean {
      return resolveGraphTypeMeta(objectType).kind === 'person';
    },
    isPivotType(objectType: string): boolean {
      return resolveGraphTypeMeta(objectType).kind === 'pivot';
    },
    getNonPersonSemantic(objectType: string): NonPersonSemantic | null {
      const meta = resolveGraphTypeMeta(objectType);
      if (meta.kind === 'entity') return meta.semanticType;
      return null;
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
