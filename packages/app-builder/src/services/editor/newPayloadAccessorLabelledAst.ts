import {
  type DataModel,
  findDataModelField,
  type LabelledAst,
  payloadAccessorsDisplayName,
  type PayloadAstNode,
  payloadAstNodeName,
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
    name: payloadAccessorsDisplayName(node),
    description: field.description,
    operandType: payloadAstNodeName,
    dataType: field.dataType,
    astNode: node,
  };
}
