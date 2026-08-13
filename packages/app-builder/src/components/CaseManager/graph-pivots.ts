import { createGraphTypeHelpers } from '@app-builder/components/Graph/data-model-map';
import { type DataModel } from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';

/** A pivot the graph can start from: ingested, identified, and backed by a person table. */
export type GraphEligiblePivot = PivotObject & { pivotObjectId: string };

export function isGraphEligiblePivot(pivot: PivotObject, dataModel: DataModel): pivot is GraphEligiblePivot {
  if (!pivot.isIngested || !pivot.pivotObjectId) return false;
  return createGraphTypeHelpers(dataModel).isPersonType(pivot.pivotObjectName);
}

export function getGraphEligiblePivots(pivotObjects: PivotObject[], dataModel: DataModel): GraphEligiblePivot[] {
  return pivotObjects.filter((pivot) => isGraphEligiblePivot(pivot, dataModel));
}
