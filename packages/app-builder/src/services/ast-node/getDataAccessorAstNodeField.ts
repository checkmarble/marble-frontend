import {
  type DataAccessorAstNode,
  type DataModel,
  type DataModelField,
  findDataModelField,
  findDataModelTable,
  isDatabaseAccess,
  isPayload,
  type TableModel,
} from '@app-builder/models';
import { assertNever } from 'typescript-utils';

export function getDataAccessorAstNodeField(
  astNode: DataAccessorAstNode,
  context: {
    triggerObjectTable: TableModel;
    dataModel: DataModel;
  },
): DataModelField {
  if (isPayload(astNode)) {
    return findDataModelField({
      table: context.triggerObjectTable,
      fieldName: astNode.children[0].constant,
    });
  }
  if (isDatabaseAccess(astNode)) {
    const table = findDataModelTable({
      dataModel: context.dataModel,
      tableName: astNode.namedChildren.tableName.constant,
      path: astNode.namedChildren.path.constant,
    });
    return findDataModelField({
      table: table,
      fieldName: astNode.namedChildren.fieldName.constant,
    });
  }
  assertNever('Unsupported DataAccessorAstNode', astNode);
}
