import { createGraphTypeHelpers } from '@app-builder/components/Graph/data-model-map';
import { type DataModel } from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';

export function isGraphEligiblePivot(pivot: PivotObject, dataModel: DataModel): boolean {
  if (!pivot.isIngested || !pivot.pivotObjectId) return false;
  return createGraphTypeHelpers(dataModel).isPersonType(pivot.pivotObjectName);
}

export function getGraphEligiblePivots(pivotObjects: PivotObject[], dataModel: DataModel): PivotObject[] {
  const { isPersonType } = createGraphTypeHelpers(dataModel);
  return pivotObjects.filter(
    (pivot) => pivot.isIngested && !!pivot.pivotObjectId && isPersonType(pivot.pivotObjectName),
  );
}
