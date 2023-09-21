import {
  type DatabaseAccessAstNode,
  databaseAccessAstNodeName,
  type DataModel,
  findDataModelField,
  findDataModelTable,
  type LabelledAst,
} from '@app-builder/models';

export function newDatabaseAccessorsLabelledAst({
  dataModel,
  node,
}: {
  dataModel: DataModel[];
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
    name: getDatabaseAccessorDisplayName(node),
    description: field.description,
    operandType: databaseAccessAstNodeName,
    dataType: field.dataType,
    astNode: node,
  };
}

export function getDatabaseAccessorDisplayName(
  node: DatabaseAccessAstNode
): string {
  const { path, fieldName } = node.namedChildren;
  return [...path.constant, fieldName.constant].join('.');
}
