import {
  type DatabaseAccessAstNode,
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
    label: databaseAccessorDisplayName(node),
    tooltip: '',
    astNode: node,
    dataModelField: field,
  };
}
