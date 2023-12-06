import {
  type DatabaseAccessAstNode,
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
    name: getDatabaseAccessorDisplayName(node),
    description: field.description,
    operandType: 'Field',
    dataType: field.dataType,
    astNode: node,
    values: field.isEnum ? field.values : undefined,
  };
}

export function getDatabaseAccessorDisplayName(
  node: DatabaseAccessAstNode,
): string {
  const { path, fieldName } = node.namedChildren;
  return [...path.constant, fieldName.constant].join('.');
}
