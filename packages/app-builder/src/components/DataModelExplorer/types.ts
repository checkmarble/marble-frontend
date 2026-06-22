import { DataModelObjectValue } from '@app-builder/models';

export type DataModelExplorerNavigationTab = {
  pivotObject: {
    pivotValue: string;
    pivotObjectName: string;
    isIngested: boolean;
    /** Pivot id, when known, to disambiguate same-valued pivots of different parent types. */
    pivotId?: string;
  };
  sourceObject: Record<string, DataModelObjectValue>;
  /** Stable id of the navigation option taken, when known. Several options can share a
   * target table, so this disambiguates which one produced this tab. */
  navigationOptionId?: string;
  sourceTableName: string;
  sourceFieldName: string;
  targetTableName: string;
  filterFieldName: string;
  orderingFieldName: string;
};
