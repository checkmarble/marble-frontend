import {
  findDataModelField,
  type LabelledAst,
  type PayloadAstNode,
  payloadAstNodeName,
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
    name: getPayloadAccessorsDisplayName(node),
    description: field.description,
    operandType: payloadAstNodeName,
    dataType: field.dataType,
    astNode: node,
  };
}

export function getPayloadAccessorsDisplayName(node: PayloadAstNode): string {
  return node.children[0].constant;
}
