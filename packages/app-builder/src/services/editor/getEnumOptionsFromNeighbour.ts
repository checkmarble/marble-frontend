import {
  type DataModel,
  type EnumValue,
  isDataAccessorAstNode,
  type TableModel,
} from '@app-builder/models';
import { type AstNodeViewModel } from '@app-builder/models/ast-node-view-model';

import { getDataAccessorAstNodeField } from '../ast-node/getDataAccessorAstNodeField';

export function getEnumValuesFromNeighbour(
  astNodeVM: AstNodeViewModel,
  context: {
    triggerObjectTable: TableModel;
    dataModel: DataModel;
  },
): EnumValue[] {
  if (!astNodeVM.parent) {
    return [];
  }
  if (astNodeVM.parent.name !== '=') {
    return [];
  }
  const neighbourNodeViewModel = astNodeVM.parent.children.find(
    (child) => child.nodeId !== astNodeVM.nodeId,
  );
  if (!neighbourNodeViewModel) {
    return [];
  }
  if (isDataAccessorAstNode(neighbourNodeViewModel)) {
    const field = getDataAccessorAstNodeField(neighbourNodeViewModel, context);
    return field.isEnum ? (field.values ?? []) : [];
  }

  return [];
}
