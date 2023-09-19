import {
  type DatabaseAccessAstNode,
  databaseAccessAstNodeName,
  databaseAccessorDisplayName,
  findDataModelField,
  findDataModelTable,
  type LabelledAst,
  type TableModel,
} from '@app-builder/models';

export function newDatabaseAccessorsLabelledAst({
  dataModel,
  node,
}: {
  dataModel: TableModel[];
  node: DatabaseAccessAstNode;
}): LabelledAst {
  const table = findDataModelTable({
    dataModel,
    tableName: node.namedChildren.tableName.constant,
    path: node.namedChildren.path.constant,
  });
  const field = findDataModelField({
    table: table,
    fieldName: node.namedChildren.fieldName.constant,
  });

  return {
    name: databaseAccessorDisplayName(node),
    description: field.description,
    operandType: databaseAccessAstNodeName,
    dataType: field.dataType,
    astNode: node,
  };
}
