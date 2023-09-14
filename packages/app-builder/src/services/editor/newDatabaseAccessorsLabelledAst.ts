import {
  type DatabaseAccessAstNode,
  databaseAccessorDisplayName,
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
    label: databaseAccessorDisplayName(node),
    tooltip: '',
    astNode: node,
    dataModelField: field,
  };
}
