import {
  type AstNode,
  type DataModel,
  type EnumValue,
  type TableModel,
} from '@app-builder/models';
import { isDataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';

import { getDataAccessorAstNodeField } from '../ast-node/getDataAccessorAstNodeField';

export function getEnumValuesFromNeighbour(
  parentAstNode: AstNode,
  childIndex: number,
  context: {
    triggerObjectTable: TableModel;
    dataModel: DataModel;
  },
): EnumValue[] {
  if (parentAstNode.name !== '=') {
    return [];
  }
  const neighbourNodes = [
    ...parentAstNode.children.slice(0, childIndex),
    ...parentAstNode.children.slice(childIndex + 1),
  ];
  const enumValues = [];
  for (const neighbourNode of neighbourNodes) {
    if (isDataAccessorAstNode(neighbourNode)) {
      const field = getDataAccessorAstNodeField(neighbourNode, context);
      if (field.isEnum) {
        enumValues.push(...(field.values ?? []));
      }
    }
  }

  return enumValues;
}
