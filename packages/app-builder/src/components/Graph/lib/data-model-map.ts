import { type DataModel, type FtmEntityPersonOption, type FtmEntityV2 } from '@app-builder/models/data-model';

/**
 * Resolves whether a graph node `type` (= data-model table name) is a person table.
 * Non-person / missing tables are not treated as pivots — pivots use `connector: true`.
 */
export function createGraphTypeHelpers(dataModel: DataModel) {
  const byName = new Map(dataModel.map((t) => [t.name, t]));

  return {
    isPersonType(objectType: string): boolean {
      return byName.get(objectType)?.semanticType === 'person';
    },
    getPersonSubEntity(objectType: string): FtmEntityPersonOption {
      const table = byName.get(objectType);
      return table?.semanticType === 'person' ? (table.subEntity ?? 'generic') : 'generic';
    },
    getSemanticType(objectType: string): FtmEntityV2 {
      return byName.get(objectType)?.semanticType ?? 'other';
    },
  };
}

export type GraphTypeHelpers = ReturnType<typeof createGraphTypeHelpers>;
