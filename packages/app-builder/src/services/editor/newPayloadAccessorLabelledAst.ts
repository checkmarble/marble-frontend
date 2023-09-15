import {
  type DataModel,
  findDataModelField,
  type LabelledAst,
  payloadAccessorsDisplayName,
  type PayloadAstNode,
} from '@app-builder/models';

export function newPayloadAccessorsLabelledAst({
  triggerObjectType,
  node,
}: {
  triggerObjectType: DataModel;
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
