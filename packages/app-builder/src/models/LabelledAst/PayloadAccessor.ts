import {
  findDataModelField,
  type LabelledAst,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';

export function newPayloadAccessorsLabelledAst({
  triggerObjectTable,
  node,
}: {
  triggerObjectTable: TableModel;
  node: PayloadAstNode;
}): LabelledAst {
  const field = findDataModelField({
    table: triggerObjectTable,
    fieldName: node.children[0].constant,
  });
  return {
    name: getPayloadAccessorsDisplayName(node),
    description: field.description,
    operandType: 'Field',
    dataType: field.dataType,
    astNode: node,
    values: field.isEnum ? field.values : undefined,
    isEnum: field.isEnum,
  };
}

export function getPayloadAccessorsDisplayName(node: PayloadAstNode): string {
  return node.children[0].constant;
}
