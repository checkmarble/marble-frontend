import {
  findDataModelField,
  type LabelledAst,
  payloadAccessorsDisplayName,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';

export function newPayloadAccessorsLabelledAst({
  triggerObjectType,
  node,
}: {
  triggerObjectType: TableModel;
  node: PayloadAstNode;
}): LabelledAst {
  const field = findDataModelField({
    table: triggerObjectType,
    fieldName: node.children[0].constant,
  });
  return {
    label: payloadAccessorsDisplayName(node),
    tooltip: '',
    astNode: node,
    dataModelField: field,
  };
}
