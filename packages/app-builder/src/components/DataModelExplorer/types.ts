import { type ClientObjectDetail } from '@app-builder/models';

export type DataModelExplorerNavigationTab = {
  pivotObject: {
    pivotValue: string;
    pivotObjectName: string;
    isIngested: boolean;
  };
  sourceObject: ClientObjectDetail['data'];
  sourceTableName: string;
  sourceFieldName: string;
  targetTableName: string;
  filterFieldName: string;
  orderingFieldName: string;
};
