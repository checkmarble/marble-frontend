import {
  type DataModel,
  type DataModelField,
  type LinkToSingle,
  type Pivot,
  type TableModel,
} from '@app-builder/models';
import * as R from 'remeda';

export interface FieldPivotOption {
  type: 'field';
  baseTableId: string;
  fieldId: string;
  id: string;
  displayValue: string;
}

function adaptFieldPivotOption({
  baseTableId,
  field,
}: {
  baseTableId: string;
  field: DataModelField;
}): FieldPivotOption {
  return {
    type: 'field',
    baseTableId,
    fieldId: field.id,
    id: field.id,
    displayValue: field.name,
  };
}

export interface LinkPivotOption {
  type: 'link';
  baseTableId: string;
  parentTableId?: string;
  parentTableName?: string;
  length?: number;
  pathLinkIds: string[];
  id: string;
  displayPath: string;
  displayValue: string;
}

export type CustomPivotOption =
  | PivotOption
  | {
      type: 'sameTable';
      baseTableId: string;
      id: string;
    };

function adaptLinkPivotOption({
  baseTableId,
  pathLinks,
}: {
  baseTableId: string;
  pathLinks: LinkToSingle[];
}): LinkPivotOption {
  const pathLinkIds = pathLinks.map((link) => link.id);
  return {
    type: 'link',
    baseTableId,
    pathLinkIds,
    parentTableId: pathLinks[pathLinks.length - 1]?.parentTableId,
    parentTableName: pathLinks[pathLinks.length - 1]?.parentTableName,
    length: pathLinks.length,
    id: pathLinkIds.join('.'),
    displayPath: `->${pathLinks.map((link) => link.name).join('->')}`,
    displayValue: pathLinks[pathLinks.length - 1]?.parentTableName ?? '',
  };
}

export type PivotOption = FieldPivotOption | LinkPivotOption;

export function getLinksPivotOptions(
  tableModel: TableModel,
  dataModel: DataModel,
): LinkPivotOption[] {
  return getLinkPivotOptions(tableModel.linksToSingle, {
    baseTableId: tableModel.id,
    tablesMap: new Map(dataModel.map((table) => [table.id, table])),
  });
}

export function getFieldPivotOptions(tableModel: TableModel): FieldPivotOption[] {
  return R.pipe(
    tableModel.fields,
    // Only allow pivots on string fields
    R.filter((field) => field.dataType === 'String'),
    //Exlude objectId field
    R.filter((field) => field.name !== 'object_id'),
    // Exclude fields that are already links
    R.filter(
      (field) =>
        tableModel.linksToSingle.find((link) => link.childFieldId === field.id) === undefined,
    ),
    R.map((field) => adaptFieldPivotOption({ baseTableId: tableModel.id, field })),
  );
}

function getLinkPivotOptions(
  linksToSingle: LinkToSingle[],
  config: {
    baseTableId: string;
    tablesMap: Map<string, TableModel>;
  },
  previousPathLinks: LinkToSingle[] = [],
  depth = 0,
): LinkPivotOption[] {
  if (depth > 10) {
    return [];
  }

  return R.pipe(
    linksToSingle,
    R.filter((link) => {
      // Skip links that are already in the path, to avoid infinite recursion (based on the backend logic)
      // This may remove some allowed loops, but it's better than infinite recursion
      return previousPathLinks.find(({ id }) => id === link.id) === undefined;
    }),
    R.map((link) => {
      const parentTable = config.tablesMap.get(link.parentTableId);
      if (!parentTable) return null;
      const parentField = parentTable.fields.find((field) => field.id === link.parentFieldId);
      if (!parentField) return null;
      return {
        parentTable,
        parentField,
        link,
      };
    }),
    R.filter(R.isNonNullish),
    R.flatMap(({ parentTable, parentField, link }) => {
      const pathLinks = previousPathLinks.concat(link);
      const pivot: LinkPivotOption = adaptLinkPivotOption({
        baseTableId: config.baseTableId,
        pathLinks,
      });

      const pivots: LinkPivotOption[] = [];

      // Only allow pivots on string fields
      if (parentField.dataType === 'String') {
        pivots.push(pivot);
      }

      return pivots.concat(
        getLinkPivotOptions(parentTable.linksToSingle, config, pathLinks, depth + 1),
      );
    }),
  );
}

export function getPivotDisplayValue(pivot: Pivot): string {
  if (pivot.type === 'field') {
    return pivot.field;
  }
  return `->${pivot.pathLinks.join('->')}`;
}
