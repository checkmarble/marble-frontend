import {
  type DataModel,
  type DataModelField,
  type LinkToSingle,
  type TableModel,
} from '@app-builder/models';

interface FieldPivot {
  type: 'field';
  baseTableId: string;
  fieldId: string;
  id: string;
  displayValue: string;
}

interface LinkPivot {
  type: 'link';
  baseTableId: string;
  pathLinkIds: string[];
  id: string;
  displayValue: string;
}

export type Pivot = FieldPivot | LinkPivot;

export function getPivotOptions(
  tableModel: TableModel,
  dataModel: DataModel,
): Pivot[] {
  const pivots: Pivot[] = [];

  tableModel.fields
    // Only allow pivots on string fields
    .filter((field) => field.dataType === 'String')
    .map((field: DataModelField) => {
      pivots.push({
        type: 'field',
        baseTableId: tableModel.id,
        fieldId: field.id,
        id: field.id,
        displayValue: field.name,
      });
    });

  const tablesMap = new Map(dataModel.map((table) => [table.id, table]));

  function recursiveLinkedPivot(
    linksToSingle: LinkToSingle[],
    previousPivot?: LinkPivot,
    depth = 0,
  ): void {
    if (depth > 10) {
      return;
    }
    for (const link of linksToSingle) {
      // Skip links that are already in the path, to avoid infinite recursion (based on the backend logic)
      // This may remove some allowed loops, but it's better than infinite recursion
      if (previousPivot?.pathLinkIds.includes(link.id)) {
        break;
      }

      const parentTable = tablesMap.get(link.parentTableId);
      if (!parentTable) break;
      const parentField = parentTable.fields.find(
        (field) => field.id === link.parentFieldId,
      );
      if (!parentField) break;

      const pathLinkIds = (previousPivot?.pathLinkIds ?? []).concat(link.id);
      const pivot: LinkPivot = {
        type: 'link',
        baseTableId: tableModel.id,
        pathLinkIds,
        id: pathLinkIds.join('.'),
        displayValue: previousPivot?.displayValue
          ? `${previousPivot?.displayValue}.${link.name}`
          : link.name,
      };

      // Only allow pivots on string fields
      if (parentField.dataType === 'String') {
        pivots.push(pivot);
      }

      recursiveLinkedPivot(parentTable.linksToSingle, pivot, depth + 1);
    }
  }
  recursiveLinkedPivot(tableModel.linksToSingle);

  return pivots;
}
