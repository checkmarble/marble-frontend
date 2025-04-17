import { type ClientObjectDetail } from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';

export type DataModelExplorerNavigationTab = {
  pivotObject: PivotObject;
  sourceObject: ClientObjectDetail['data'];
  sourceTableName: string;
  sourceFieldName: string;
  targetTableName: string;
  filterFieldName: string;
  orderingFieldName: string;
};
