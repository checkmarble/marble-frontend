import { DataModelObjectValue } from '@app-builder/models';

export type DataModelExplorerNavigationTab = {
  pivotObject: {
    pivotValue: string;
    pivotObjectName: string;
    isIngested: boolean;
  };
  sourceObject: Record<string, DataModelObjectValue>;
  sourceTableName: string;
  sourceFieldName: string;
  targetTableName: string;
  filterFieldName: string;
  orderingFieldName: string;
};
