import {
  type DataModel,
  findDataModelField,
  findDataModelTableByName,
  type LabelledAst,
  payloadAccessorsDisplayName,
  type PayloadAstNode,
} from '@app-builder/models';

export function newPayloadAccessorsLabelledAst({
  dataModel,
  triggerObjectType,
  node,
}: {
  dataModel: DataModel[];
  triggerObjectType: string;
  node: PayloadAstNode;
}): LabelledAst {
  const field = findDataModelField({
    table: findDataModelTableByName({
      dataModel,
      tableName: triggerObjectType,
    }),
    fieldName: node.children[0].constant,
  });
  return {
    label: payloadAccessorsDisplayName(node),
    tooltip: '',
    astNode: node,
    dataModelField: field,
  };
}
