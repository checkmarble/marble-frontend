import { type DataModel, type FtmEntityPersonOption, type TableModel } from '@app-builder/models/data-model';

export type GraphTypeMeta = { kind: 'person'; defaultSubEntity: FtmEntityPersonOption } | { kind: 'other' };

function metaFromTable(table: TableModel | undefined): GraphTypeMeta {
  if (table?.semanticType !== 'person') return { kind: 'other' };
  return { kind: 'person', defaultSubEntity: table.subEntity ?? 'generic' };
}

/**
 * Resolves whether a graph node `type` (= data-model table name) is a person table.
 * Non-person / missing tables are not treated as pivots — pivots use `connector: true`.
 */
export function createGraphTypeHelpers(dataModel: DataModel) {
  const byName = new Map(dataModel.map((t) => [t.name, t]));

  function resolveGraphTypeMeta(objectType: string): GraphTypeMeta {
    return metaFromTable(byName.get(objectType));
  }

  return {
    resolveGraphTypeMeta,
    isPersonType(objectType: string): boolean {
      return resolveGraphTypeMeta(objectType).kind === 'person';
    },
    getPersonSubEntity(objectType: string): FtmEntityPersonOption {
      const meta = resolveGraphTypeMeta(objectType);
      return meta.kind === 'person' ? meta.defaultSubEntity : 'generic';
    },
  };
}

export type GraphTypeHelpers = ReturnType<typeof createGraphTypeHelpers>;
